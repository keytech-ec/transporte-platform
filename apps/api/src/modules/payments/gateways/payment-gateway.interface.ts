import { PaymentGateway } from '@transporte-platform/database';

export interface CreatePaymentLinkParams {
  reservationId: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentLinkResponse {
  paymentUrl: string;
  transactionId: string;
  gatewayTransactionId?: string;
}

export interface ProcessWebhookParams {
  payload: any;
  signature?: string;
}

export interface WebhookResponse {
  success: boolean;
  transactionId?: string;
  status?: string;
  message?: string;
}

export interface IPaymentGateway {
  gateway: PaymentGateway;
  createPaymentLink(params: CreatePaymentLinkParams): Promise<CreatePaymentLinkResponse>;
  processWebhook(params: ProcessWebhookParams): Promise<WebhookResponse>;
  validateWebhookSignature(payload: any, signature: string): boolean;
}

