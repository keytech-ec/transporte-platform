import { create } from 'zustand';

interface BookingState {
  selectedTrip: string | null;
  selectedSeats: string[];
  lockId: string | null;
  passengerCount: number;
  customer: {
    documentType: string;
    documentNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
  passengers: Array<{
    documentType: string;
    documentNumber: string;
    firstName: string;
    lastName: string;
    passengerType: string;
  }>;
  reservationType: 'ONE_WAY' | 'ROUND_TRIP';
  clear: () => void;
  setSelectedTrip: (tripId: string) => void;
  setSelectedSeats: (seatIds: string[]) => void;
  setLockId: (lockId: string) => void;
  setPassengerCount: (count: number) => void;
  setCustomer: (customer: BookingState['customer']) => void;
  setPassengers: (passengers: BookingState['passengers']) => void;
  setReservationType: (type: 'ONE_WAY' | 'ROUND_TRIP') => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedTrip: null,
  selectedSeats: [],
  lockId: null,
  passengerCount: 1,
  customer: null,
  passengers: [],
  reservationType: 'ONE_WAY',
  clear: () =>
    set({
      selectedTrip: null,
      selectedSeats: [],
      lockId: null,
      passengerCount: 1,
      customer: null,
      passengers: [],
      reservationType: 'ONE_WAY',
    }),
  setSelectedTrip: (tripId) => set({ selectedTrip: tripId }),
  setSelectedSeats: (seatIds) => set({ selectedSeats: seatIds }),
  setLockId: (lockId) => set({ lockId }),
  setPassengerCount: (count) => set({ passengerCount: count }),
  setCustomer: (customer) => set({ customer }),
  setPassengers: (passengers) => set({ passengers }),
  setReservationType: (type) => set({ reservationType: type }),
}));

