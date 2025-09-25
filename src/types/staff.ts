export interface StaffMember {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  googleChat?: string;
  isActive: boolean;
}

export interface StaffDirectory {
  members: StaffMember[];
  lastUpdated: Date;
}