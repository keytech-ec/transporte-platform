export enum SendFormVia {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  NONE = 'NONE',
}

export interface ContactInfo {
  documentType: 'CEDULA' | 'PASSPORT' | 'RUC';
  documentNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

export interface PaymentInfo {
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD';
  receiptNumber?: string;
  isPartial: boolean;
}

export interface CreateManualSaleResult {
  reservationId: string;
  bookingReference: string;
  passengerFormUrl: string;
  passengerFormToken: string;
  whatsappUrl?: string;
}

export interface SaleSummary {
  salesCount: number;
  totalAmount: number;
  cashAmount: number;
  transferAmount: number;
  cardAmount: number;
}
