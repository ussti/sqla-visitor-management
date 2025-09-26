'use client';

import React, { useState, useEffect } from 'react';
import { serviceRecovery } from '@/lib/api-recovery';

interface SystemStatusProps {
  className?: string;
  compact?: boolean;
  showDetails?: boolean;
}

export function SystemStatusIndicator({ className = '', compact = false, showDetails = false }: SystemStatusProps) {
  const [status, setStatus] = useState<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
  }>({
    overall: 'healthy',
    services: {}
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const healthStatus = await serviceRecovery.checkServiceHealth();
        setStatus(healthStatus);
        setLastCheck(new Date());
      } catch (error) {
        console.error('Failed to check system status:', error);
        setStatus({
          overall: 'unhealthy',
          services: { system: 'unhealthy' }
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'unhealthy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'unhealthy': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'All Systems Operational';
      case 'degraded': return 'Some Services Degraded';
      case 'unhealthy': return 'System Issues Detected';
      default: return 'Status Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center space-x-2 text-gray-400 text-xs">
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
          <span>Checking system status...</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`${className}`}>
        <div className={`flex items-center space-x-2 text-xs ${getStatusColor(status.overall)}`}>
          <span>{getStatusIcon(status.overall)}</span>
          <span>{status.overall}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">System Status</h3>
          <span className={`text-xs ${getStatusColor(status.overall)}`}>
            {getStatusIcon(status.overall)} {getStatusText(status.overall)}
          </span>
        </div>

        {showDetails && Object.keys(status.services).length > 0 && (
          <div className="space-y-2 mb-3">
            <h4 className="text-gray-400 text-xs font-medium">Service Details:</h4>
            {Object.entries(status.services).map(([service, serviceStatus]) => (
              <div key={service} className="flex items-center justify-between text-xs">
                <span className="text-gray-300 capitalize">{service} Service</span>
                <span className={`${getStatusColor(serviceStatus)} font-medium`}>
                  {getStatusIcon(serviceStatus)} {serviceStatus}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500">
          Last checked: {lastCheck.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

// Connection status for real-time feedback
export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');

        const handleConnectionChange = () => {
          setConnectionType(connection.effectiveType || 'unknown');
        };

        connection.addEventListener('change', handleConnectionChange);

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
          connection.removeEventListener('change', handleConnectionChange);
        };
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="bg-red-900/20 border border-red-600 rounded-lg p-3 text-center">
        <div className="flex items-center justify-center space-x-2 text-red-400">
          <span>🔴</span>
          <span className="text-sm font-medium">No Internet Connection</span>
        </div>
        <p className="text-red-300 text-xs mt-1">
          Please check your network connection
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500">
      <span>🟢</span>
      <span>Online</span>
      {connectionType !== 'unknown' && (
        <span className="text-gray-400">({connectionType})</span>
      )}
    </div>
  );
}

// Service-specific status indicators
export function ServiceStatusBadge({
  serviceName,
  status,
  compact = true
}: {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  compact?: boolean;
}) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-900/20 border-green-600 text-green-400';
      case 'degraded':
        return 'bg-yellow-900/20 border-yellow-600 text-yellow-400';
      case 'unhealthy':
        return 'bg-red-900/20 border-red-600 text-red-400';
      default:
        return 'bg-gray-900/20 border-gray-600 text-gray-400';
    }
  };

  if (compact) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
        {getStatusIcon(status)} {serviceName}
      </span>
    );
  }

  return (
    <div className={`rounded-lg p-3 border ${getStatusStyles(status)}`}>
      <div className="flex items-center space-x-2">
        <span>{getStatusIcon(status)}</span>
        <div>
          <div className="font-medium">{serviceName}</div>
          <div className="text-xs opacity-75 capitalize">{status}</div>
        </div>
      </div>
    </div>
  );
}

// System health dashboard
export function SystemHealthDashboard() {
  const [detailedStatus, setDetailedStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetailedStatus = async () => {
      try {
        const healthStatus = await serviceRecovery.checkServiceHealth();
        const circuitBreakerStatus = serviceRecovery.getServiceStatus();

        setDetailedStatus({
          health: healthStatus,
          circuitBreakers: circuitBreakerStatus
        });
      } catch (error) {
        console.error('Failed to load detailed status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetailedStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-white font-semibold mb-4">System Health Dashboard</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <h4 className="text-gray-400 text-sm font-medium">Service Status</h4>
          {detailedStatus?.health?.services && Object.entries(detailedStatus.health.services).map(([service, status]) => (
            <ServiceStatusBadge
              key={service}
              serviceName={service}
              status={status as any}
              compact={false}
            />
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-gray-400 text-sm font-medium">Circuit Breakers</h4>
          {detailedStatus?.circuitBreakers && Object.entries(detailedStatus.circuitBreakers).map(([service, status]: [string, any]) => (
            <div key={service} className="bg-black/20 rounded p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 capitalize">{service}</span>
                <span className={`font-medium ${
                  status.state === 'CLOSED' ? 'text-green-400' :
                  status.state === 'HALF_OPEN' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {status.state}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Failures: {status.failures}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SystemStatusIndicator showDetails={true} />
    </div>
  );
}