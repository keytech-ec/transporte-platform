const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'Error desconocido',
      statusCode: response.status,
    }));
    throw error;
  }

  const data: ApiResponse<T> = await response.json();
  return data.data;
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },
};

// Reservations API
export const reservationsApi = {
  searchTrips: (params: {
    origin: string;
    destination: string;
    date: string;
    passengers: number;
  }) => api.get(`/reservations/trips/search?${new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    passengers: params.passengers.toString(),
  }).toString()}`),

  getTripSeats: (tripId: string) => api.get(`/reservations/trips/${tripId}/seats`),

  lockSeats: (data: { tripId: string; seatIds: string[] }) =>
    api.post('/reservations/lock-seats', data),

  createReservation: (data: {
    tripId: string;
    lockId: string;
    seatIds: string[];
    customer: {
      documentType: string;
      documentNumber: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    passengers: Array<{
      documentType: string;
      documentNumber: string;
      firstName: string;
      lastName: string;
      passengerType: string;
    }>;
    reservationType: string;
  }) => api.post('/reservations', data),

  getByReference: (reference: string) =>
    api.get(`/reservations/by-reference/${reference}`),

  confirm: (id: string) => api.patch(`/reservations/${id}/confirm`),

  cancel: (id: string) => api.patch(`/reservations/${id}/cancel`),
};

// Payments API
export const paymentsApi = {
  createPaymentLink: (data: { reservationId: string; gateway: 'DEUNA' | 'PAYPHONE' }) =>
    api.post('/payments/create-link', data),

  getByReservation: (reservationId: string) =>
    api.get(`/payments/reservation/${reservationId}`),

  getTransaction: (id: string) => api.get(`/payments/transaction/${id}`),
};

