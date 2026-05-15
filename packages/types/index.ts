export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TECHNICIAN = 'TECHNICIAN',
  CUSTOMER = 'CUSTOMER'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  ON_THE_WAY = 'ON_THE_WAY',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  profileImage?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  technicianId?: string;
  categoryId: string;
  scheduledAt: string;
  completedAt?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
}
