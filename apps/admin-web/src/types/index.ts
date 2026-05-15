export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'CUSTOMER' | 'MANAGER' | 'SUPER_ADMIN';

export interface User {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  phone?: string;
  enabled?: boolean;
  createdDate?: string;
  createdAt?: string;   // fallback alias
  profileImageUrl?: string;
  totalBookings?: number;
  activeRequests?: number;
  registrationDate?: string;
  // Technician metadata
  skills?: { skillName: string; experienceYears: number; proficiencyLevel: number }[];
  experienceYears?: number;
  ratings?: number;
  proficiencyLevel?: number;
}

export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  token: string;
  accessToken?: string;
  refreshToken: string;
  user: User;
}

export interface DashboardStats {
  totalCustomers: number;
  totalTechnicians: number;
  totalServiceRequests: number;
  pendingTickets: number;
  completedTickets: number;
  totalRevenue: number;
  monthlyRevenue: number;
  categoryWiseBookings: Record<string, number>;
}

export interface Category {
  id: string;
  categoryName: string;
  categoryDescription: string;
  imageUrl: string;
  active: boolean;
}

export interface AppService {
  id: string;
  serviceName: string;
  serviceDescription: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  status: string;
  isActive: boolean;
  category?: Category;
}

export interface ServiceRequestAttachmentItem {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export interface ServiceRequest {
  id: string;
  requestId?: string;
  customer: User;
  service?: AppService[];
  services?: AppService[]; // backend alias
  attachments?: ServiceRequestAttachmentItem[];
  description: string;
  status: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  scheduledDate?: string;
  scheduledTime?: string;
  totalAmount: number;
  assignedTechnician?: User;
  createdAt: string;
}

export interface TechnicianLocation {
  technicianId: string;
  latitude: number;
  longitude: number;
  lastUpdated: string;
}
