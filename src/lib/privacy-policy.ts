// Privacy Policy content for SQLA Visitor Management System
export const PRIVACY_POLICY = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Effective Date: January 2025",
    sections: [
      {
        title: "Information We Collect",
        content: [
          "Personal Information: Name, surname, email address, company/organization name",
          "Biometric Data: Photo captured during registration for security identification purposes",
          "Digital Signatures: Electronic signature for NDA agreement",
          "Visit Information: Date, time, host information, and purpose of visit"
        ]
      },
      {
        title: "How We Use Your Information",
        content: [
          "Security and Access Control: Verify identity and manage studio access",
          "Host Notification: Inform your designated host of your arrival",
          "Legal Compliance: Maintain visitor records as required by law",
          "Communication: Send welcome information and studio guidelines"
        ]
      },
      {
        title: "Data Storage and Retention",
        content: [
          "Data Storage: Information is securely stored in Monday.com platform with encryption",
          "Retention Period: Visitor data is retained for 2 years for security purposes",
          "Access Control: Only authorized SQLA staff have access to visitor information"
        ]
      },
      {
        title: "Your Rights (GDPR/CCPA)",
        content: [
          "Right to Access: Request copies of your personal data",
          "Right to Rectification: Request correction of inaccurate information",
          "Right to Erasure: Request deletion of your personal data",
          "Right to Data Portability: Receive your data in a structured format",
          "Right to Object: Object to processing for specific purposes"
        ]
      },
      {
        title: "Biometric Data Consent",
        content: [
          "Purpose: Photos are captured solely for security identification during your visit",
          "Storage: Images are securely stored and linked to your visitor record",
          "Retention: Photos are retained with your visitor record for security audit purposes",
          "Rights: You may request deletion of biometric data at any time"
        ]
      },
      {
        title: "Contact Information",
        content: [
          "For privacy-related inquiries or to exercise your rights:",
          "Email: privacy@sqla.com",
          "Address: SQLA Studio, Los Angeles, CA",
          "Response Time: We will respond to requests within 30 days"
        ]
      }
    ]
  },
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Fecha de Vigencia: Enero 2025",
    sections: [
      {
        title: "Información que Recopilamos",
        content: [
          "Información Personal: Nombre, apellido, dirección de email, empresa/organización",
          "Datos Biométricos: Foto capturada durante el registro para identificación de seguridad",
          "Firmas Digitales: Firma electrónica para acuerdo de confidencialidad",
          "Información de Visita: Fecha, hora, información del anfitrión y propósito de la visita"
        ]
      },
      {
        title: "Cómo Usamos su Información",
        content: [
          "Seguridad y Control de Acceso: Verificar identidad y gestionar acceso al estudio",
          "Notificación al Anfitrión: Informar a su anfitrión designado de su llegada",
          "Cumplimiento Legal: Mantener registros de visitantes según requiere la ley",
          "Comunicación: Enviar información de bienvenida y pautas del estudio"
        ]
      },
      {
        title: "Almacenamiento y Retención de Datos",
        content: [
          "Almacenamiento: La información se almacena de forma segura en Monday.com con encriptación",
          "Período de Retención: Los datos de visitantes se retienen por 2 años con fines de seguridad",
          "Control de Acceso: Solo el personal autorizado de SQLA tiene acceso a la información de visitantes"
        ]
      },
      {
        title: "Sus Derechos (GDPR/CCPA)",
        content: [
          "Derecho de Acceso: Solicitar copias de sus datos personales",
          "Derecho de Rectificación: Solicitar corrección de información inexacta",
          "Derecho al Olvido: Solicitar eliminación de sus datos personales",
          "Derecho a la Portabilidad: Recibir sus datos en formato estructurado",
          "Derecho a Objetar: Objetar el procesamiento para propósitos específicos"
        ]
      },
      {
        title: "Consentimiento de Datos Biométricos",
        content: [
          "Propósito: Las fotos se capturan únicamente para identificación de seguridad durante su visita",
          "Almacenamiento: Las imágenes se almacenan de forma segura y se vinculan a su registro de visitante",
          "Retención: Las fotos se retienen con su registro de visitante para fines de auditoría de seguridad",
          "Derechos: Puede solicitar la eliminación de datos biométricos en cualquier momento"
        ]
      },
      {
        title: "Información de Contacto",
        content: [
          "Para consultas relacionadas con privacidad o para ejercer sus derechos:",
          "Email: privacy@sqla.com",
          "Dirección: SQLA Studio, Los Angeles, CA",
          "Tiempo de Respuesta: Responderemos a solicitudes dentro de 30 días"
        ]
      }
    ]
  }
};

// Consent types for different data processing activities
export const CONSENT_TYPES = {
  PERSONAL_DATA: 'personal_data',
  BIOMETRIC_DATA: 'biometric_data',
  PHOTO_CAPTURE: 'photo_capture',
  EMAIL_COMMUNICATIONS: 'email_communications',
  DATA_RETENTION: 'data_retention'
} as const;

export type ConsentType = typeof CONSENT_TYPES[keyof typeof CONSENT_TYPES];

// Consent record structure
export interface ConsentRecord {
  type: ConsentType;
  granted: boolean;
  timestamp: Date;
  version: string; // Privacy policy version
  ipAddress?: string;
  userAgent?: string;
}