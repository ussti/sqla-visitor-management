export interface Visitor {
  id?: string;
  name: string;
  surname: string;
  email: string;
  organization?: string;
  hostId: string;
  hostName: string;
  photoUrl?: string;
  ndaSignedAt?: Date;
  ndaPdfUrl?: string;
  visitDate: Date;
  status: 'Registered' | 'Checked In' | string;
  createdAt: Date;
  lastUpdated?: Date;
  notifications?: Array<{
    type: 'email' | 'chat';
    status: 'sent' | 'failed';
    messageId?: string;
    timestamp: Date;
  }>;
}

export interface VisitorFormData {
  name: string;
  surname: string;
  email: string;
  organization?: string;
  hostId: string;
}

export interface VisitorPhoto {
  file: File;
  dataUrl: string;
}