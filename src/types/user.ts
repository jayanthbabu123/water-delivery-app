export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DELIVERY = 'DELIVERY',
  ADMIN = 'ADMIN'
}

export interface BaseUser {
  id: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Customer extends BaseUser {
  role: UserRole.CUSTOMER;
  communityId: string;
  apartmentNumber: string;
  defaultPaymentMethodId?: string;
  useBiometrics: boolean;
}

export interface DeliveryPerson extends BaseUser {
  role: UserRole.DELIVERY;
  employeeId: string;
  assignedCommunities: string[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  ratings: number[];
  avgRating?: number;
  totalDeliveries: number;
}

export interface Admin extends BaseUser {
  role: UserRole.ADMIN;
  email: string;
  name: string;
  permissions: string[];
  lastLogin: Date;
}

export type User = Customer | DeliveryPerson | Admin;

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}