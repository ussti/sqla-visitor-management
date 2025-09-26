interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: Error) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryCondition: (error) => {
    // Retry on network errors, timeouts, and 5xx status codes
    if (error.message.includes('fetch') || error.message.includes('network')) return true;
    if (error.message.includes('timeout')) return true;
    if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) return true;
    return false;
  }
};

export class APIRecoveryService {
  private static instance: APIRecoveryService;
  private retryConfig: RetryConfig;

  private constructor(config: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  static getInstance(config?: Partial<RetryConfig>): APIRecoveryService {
    if (!APIRecoveryService.instance) {
      APIRecoveryService.instance = new APIRecoveryService(config);
    }
    return APIRecoveryService.instance;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customConfig };
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry if this is the last attempt
        if (attempt === config.maxRetries) {
          break;
        }

        // Check if we should retry this error
        if (config.retryCondition && !config.retryCondition(lastError)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );

        console.warn(`API operation failed (attempt ${attempt + 1}/${config.maxRetries + 1}):`, lastError.message);
        console.warn(`Retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  async fetchWithRetry(
    url: string,
    options?: RequestInit,
    customConfig?: Partial<RetryConfig>
  ): Promise<Response> {
    return this.executeWithRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    }, customConfig);
  }
}

// Circuit breaker pattern for API failures
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold: number = 5,
    private resetTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.resetTimeout) {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`Circuit breaker opened after ${this.failures} failures`);
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Enhanced error recovery for specific service types
export class ServiceRecovery {
  private apiRecovery: APIRecoveryService;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor() {
    this.apiRecovery = APIRecoveryService.getInstance();
  }

  private getCircuitBreaker(serviceName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker());
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  async executeEmailService<T>(operation: () => Promise<T>): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker('email');

    return circuitBreaker.execute(() =>
      this.apiRecovery.executeWithRetry(operation, {
        maxRetries: 2,
        baseDelay: 2000,
        retryCondition: (error) => {
          // Retry email service errors except authentication errors
          return !error.message.includes('authentication') &&
                 !error.message.includes('unauthorized');
        }
      })
    );
  }

  async executeMondayService<T>(operation: () => Promise<T>): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker('monday');

    return circuitBreaker.execute(() =>
      this.apiRecovery.executeWithRetry(operation, {
        maxRetries: 3,
        baseDelay: 1000,
        retryCondition: (error) => {
          // Retry Monday.com API errors except rate limiting
          return !error.message.includes('rate limit') &&
                 !error.message.includes('429');
        }
      })
    );
  }

  async executeChatService<T>(operation: () => Promise<T>): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker('chat');

    return circuitBreaker.execute(() =>
      this.apiRecovery.executeWithRetry(operation, {
        maxRetries: 2,
        baseDelay: 1500,
        retryCondition: (error) => {
          // Retry Google Chat errors except webhook configuration errors
          return !error.message.includes('webhook') &&
                 !error.message.includes('400');
        }
      })
    );
  }

  getServiceStatus() {
    const status: Record<string, any> = {};

    for (const [serviceName, circuitBreaker] of this.circuitBreakers) {
      status[serviceName] = circuitBreaker.getState();
    }

    return status;
  }

  // Health check method
  async checkServiceHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
  }> {
    const services: Record<string, 'healthy' | 'degraded' | 'unhealthy'> = {};

    for (const [serviceName, circuitBreaker] of this.circuitBreakers) {
      const state = circuitBreaker.getState();

      if (state.state === 'CLOSED') {
        services[serviceName] = 'healthy';
      } else if (state.state === 'HALF_OPEN') {
        services[serviceName] = 'degraded';
      } else {
        services[serviceName] = 'unhealthy';
      }
    }

    const healthyServices = Object.values(services).filter(s => s === 'healthy').length;
    const totalServices = Object.keys(services).length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyServices === totalServices) {
      overall = 'healthy';
    } else if (healthyServices > totalServices / 2) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    return { overall, services };
  }
}

// Error classification and user-friendly messaging
export class ErrorHandler {
  static classifyError(error: Error): {
    type: 'network' | 'validation' | 'authentication' | 'service' | 'unknown';
    severity: 'low' | 'medium' | 'high';
    userMessage: string;
    technicalMessage: string;
    recoverable: boolean;
  } {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
      return {
        type: 'network',
        severity: 'medium',
        userMessage: 'Connection issue detected. Please check your internet connection and try again.',
        technicalMessage: error.message,
        recoverable: true
      };
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('authentication') || message.includes('403')) {
      return {
        type: 'authentication',
        severity: 'high',
        userMessage: 'Authentication failed. Please refresh the page and try again.',
        technicalMessage: error.message,
        recoverable: false
      };
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('400')) {
      return {
        type: 'validation',
        severity: 'low',
        userMessage: 'Please check your input and try again.',
        technicalMessage: error.message,
        recoverable: true
      };
    }

    // Service errors
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return {
        type: 'service',
        severity: 'high',
        userMessage: 'Our services are temporarily unavailable. Please try again in a few minutes.',
        technicalMessage: error.message,
        recoverable: true
      };
    }

    // Default unknown error
    return {
      type: 'unknown',
      severity: 'medium',
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: error.message,
      recoverable: true
    };
  }

  static createUserFriendlyError(error: Error) {
    const classification = this.classifyError(error);

    return {
      ...classification,
      timestamp: new Date().toISOString(),
      errorId: Date.now().toString(36),
      canRetry: classification.recoverable
    };
  }
}

// Export singleton instance
export const serviceRecovery = new ServiceRecovery();