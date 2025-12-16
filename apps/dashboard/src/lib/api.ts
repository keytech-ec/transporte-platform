import axios, { AxiosInstance, AxiosError } from 'axios';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  model: string;
  brand: string;
  capacity: number;
  type?: string; // Vehicle type (e.g., bus, van, etc.)
  year?: number; // Year of manufacture
  status: 'available' | 'in_service' | 'maintenance' | 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleData {
  licensePlate: string;
  model: string;
  brand: string;
  capacity: number;
  status?: 'available' | 'in_service' | 'maintenance';
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {}

export interface Service {
  id: string;
  name: string;
  description?: string;
  origin?: string;
  destination?: string;
  basePrice: number;
  duration?: number; // Duration in minutes
  type: 'regular' | 'express' | 'vip' | 'direct' | 'with_stops';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  basePrice: number;
  type: 'regular' | 'express' | 'vip';
  status?: 'active' | 'inactive';
}

export interface UpdateServiceData extends Partial<CreateServiceData> {}

export interface Trip {
  id: string;
  serviceId: string;
  vehicleId: string;
  driverId?: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  service?: Service;
  vehicle?: Vehicle;
}

export interface CreateTripData {
  serviceId: string;
  vehicleId: string;
  driverId?: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface UpdateTripData extends Partial<CreateTripData> {}

export interface TripQueryParams {
  status?: string;
  serviceId?: string;
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface Seat {
  id: string;
  tripId: string;
  seatNumber: string;
  row: number;
  column: number;
  status: 'available' | 'reserved' | 'occupied';
  reservationId?: string;
}

export interface Reservation {
  id: string;
  tripId: string;
  userId: string;
  seatIds: string[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  bookingReference?: string;
  reference?: string; // Alias for bookingReference for backwards compatibility
  passengers?: any[]; // Array of passenger data
  createdAt: string;
  updatedAt: string;
  trip?: Trip;
  seats?: Seat[];
}

export interface ReservationQueryParams {
  status?: string;
  paymentStatus?: string;
  tripId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalReservations: number;
  totalRevenue: number;
  activeTrips: number;
  availableVehicles: number;
  pendingReservations: number;
  completedTrips: number;
  revenueGrowth: number;
  reservationsGrowth: number;
}

export interface ChartDataPoint {
  date: string;
  reservations: number;
  revenue: number;
}

export interface ReservationsChartData {
  data: ChartDataPoint[];
  summary: {
    totalReservations: number;
    totalRevenue: number;
    averageReservationsPerDay: number;
    averageRevenuePerDay: number;
  };
}

export interface CreateManualSaleData {
  tripId: string;
  seatIds: string[];
  contact: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  payment: {
    saleChannel: 'POS_CASH' | 'POS_TRANSFER' | 'POS_CARD';
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD';
    amountPaid: number;
  };
  notes?: string;
}

export interface ManualSaleResult {
  reservation: Reservation;
  bookingReference: string;
  passengerFormToken: string;
  passengerFormUrl: string;
}

export interface MySale {
  id: string;
  bookingReference: string;
  tripInfo: {
    id: string;
    origin: string;
    destination: string;
    serviceName: string;
    departureDate: string;
    departureTime: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
  };
  seatCount: number;
  seatNumbers: string[];
  totalAmount: number;
  saleChannel: string;
  paymentMethod: string;
  passengerFormCompleted: boolean;
  createdAt: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  errors?: Record<string, string[]>;
}

// API Client Class
class ApiClient {
  private client: AxiosInstance;
  private tokenKey = 'auth_token';

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Unwrap response and handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Unwrap the backend response {success: true, data: {...}} -> {...}
        if (response.data && response.data.success && response.data.data !== undefined) {
          response.data = response.data.data;
        }
        return response;
      },
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          const { status, data } = error.response;

          // Handle unauthorized - clear token and redirect to login
          if (status === 401) {
            this.clearToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }

          // Format error message
          const errorMessage = data?.message || error.message || 'An unexpected error occurred';

          throw {
            message: errorMessage,
            statusCode: status,
            error: data?.error,
            errors: data?.errors,
          } as ApiError;
        }

        // Network error
        throw {
          message: 'Network error. Please check your internet connection.',
          statusCode: 0,
        } as ApiError;
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    this.setToken(response.data.access_token);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  logout(): void {
    this.clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const response = await this.client.get<Vehicle[]>('/vehicles');
    return response.data;
  }

  async getVehicle(id: string): Promise<Vehicle> {
    const response = await this.client.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  }

  async createVehicle(data: CreateVehicleData): Promise<Vehicle> {
    const response = await this.client.post<Vehicle>('/vehicles', data);
    return response.data;
  }

  async updateVehicle(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    const response = await this.client.patch<Vehicle>(`/vehicles/${id}`, data);
    return response.data;
  }

  async deleteVehicle(id: string): Promise<void> {
    await this.client.delete(`/vehicles/${id}`);
  }

  // Services
  async getServices(): Promise<Service[]> {
    const response = await this.client.get<Service[]>('/services');
    return response.data;
  }

  async getService(id: string): Promise<Service> {
    const response = await this.client.get<Service>(`/services/${id}`);
    return response.data;
  }

  async createService(data: CreateServiceData): Promise<Service> {
    const response = await this.client.post<Service>('/services', data);
    return response.data;
  }

  async updateService(id: string, data: UpdateServiceData): Promise<Service> {
    const response = await this.client.patch<Service>(`/services/${id}`, data);
    return response.data;
  }

  async deleteService(id: string): Promise<void> {
    await this.client.delete(`/services/${id}`);
  }

  // Trips
  async getTrips(params?: TripQueryParams): Promise<Trip[]> {
    const response = await this.client.get<Trip[]>('/trips', { params });
    return response.data;
  }

  async getTrip(id: string): Promise<Trip> {
    const response = await this.client.get<Trip>(`/trips/${id}`);
    return response.data;
  }

  async createTrip(data: CreateTripData): Promise<Trip> {
    const response = await this.client.post<Trip>('/trips', data);
    return response.data;
  }

  async updateTrip(id: string, data: UpdateTripData): Promise<Trip> {
    const response = await this.client.patch<Trip>(`/trips/${id}`, data);
    return response.data;
  }

  async deleteTrip(id: string): Promise<void> {
    await this.client.delete(`/trips/${id}`);
  }

  async getTripSeats(id: string): Promise<Seat[]> {
    const response = await this.client.get<Seat[]>(`/trips/${id}/seats`);
    return response.data;
  }

  // Reservations
  async getReservations(params?: ReservationQueryParams): Promise<Reservation[]> {
    const response = await this.client.get<Reservation[]>('/reservations', { params });
    return response.data;
  }

  async getReservation(id: string): Promise<Reservation> {
    const response = await this.client.get<Reservation>(`/reservations/${id}`);
    return response.data;
  }

  async updateReservation(id: string, data: Partial<Reservation>): Promise<Reservation> {
    const response = await this.client.patch<Reservation>(`/reservations/${id}`, data);
    return response.data;
  }

  async cancelReservation(id: string): Promise<Reservation> {
    const response = await this.client.post<Reservation>(`/reservations/${id}/cancel`);
    return response.data;
  }

  // Dashboard Metrics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }

  async getReservationsChart(days: number = 7): Promise<ReservationsChartData> {
    const response = await this.client.get<ReservationsChartData>('/dashboard/reservations-chart', {
      params: { days },
    });
    return response.data;
  }

  // Sales
  async createManualSale(data: CreateManualSaleData): Promise<ManualSaleResult> {
    const response = await this.client.post<ManualSaleResult>('/sales/create', data);
    return response.data;
  }

  async getMySales(params?: { from?: string; to?: string; tripId?: string }): Promise<MySale[]> {
    const response = await this.client.get<MySale[]>('/sales/my-sales', { params });
    return response.data;
  }

  async resendPassengerForm(reservationId: string): Promise<{ message: string; passengerFormUrl: string }> {
    const response = await this.client.post<{ message: string; passengerFormUrl: string }>(
      `/sales/${reservationId}/resend-form`
    );
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export default
export default api;
