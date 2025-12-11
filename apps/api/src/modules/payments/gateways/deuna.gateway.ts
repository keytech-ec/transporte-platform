import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from '@transporte-platform/database';
import {
  IPaymentGateway,
  CreatePaymentLinkParams,
  CreatePaymentLinkResponse,
  ProcessWebhookParams,
  WebhookResponse,
} from './payment-gateway.interface';
import * as crypto from 'crypto';

@Injectable()
export class DeunaGateway implements IPaymentGateway {
  gateway = PaymentGateway.DEUNA;
  private apiKey: string;
  private webhookSecret: string;
  private baseUrl: string;
  private isMock: boolean;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEUNA_API_KEY') || '';
    this.webhookSecret = this.configService.get<string>('DEUNA_WEBHOOK_SECRET') || '';
    this.baseUrl = this.configService.get<string>('DEUNA_BASE_URL') || 'https://api.deuna.com';
    this.isMock = !this.apiKey || !this.webhookSecret;
  }

  async createPaymentLink(
    params: CreatePaymentLinkParams,
  ): Promise<CreatePaymentLinkResponse> {
    if (this.isMock) {
      // Mock implementation for MVP
      const mockTransactionId = `deuna_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockPaymentUrl = `https://checkout.deuna.com/mock/${mockTransactionId}`;

      // Simulate async confirmation after 5 seconds
      setTimeout(() => {
        // This would be handled by the webhook in a real scenario
        console.log(`[MOCK] DeUNA payment would be confirmed for transaction: ${mockTransactionId}`);
      }, 5000);

      return {
        paymentUrl: mockPaymentUrl,
        transactionId: mockTransactionId,
        gatewayTransactionId: mockTransactionId,
      };
    }

    // Real implementation
    try {
      const response = await fetch(`${this.baseUrl}/v1/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency || 'USD',
          order_id: params.reservationId,
          customer: {
            email: params.customerEmail,
            name: params.customerName,
          },
          metadata: params.metadata,
          success_url: `${this.configService.get<string>('APP_URL')}/payments/success`,
          cancel_url: `${this.configService.get<string>('APP_URL')}/payments/cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeUNA API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        paymentUrl: data.checkout_url,
        transactionId: data.transaction_id,
        gatewayTransactionId: data.id,
      };
    } catch (error) {
      throw new Error(`Failed to create DeUNA payment link: ${error.message}`);
    }
  }

  async processWebhook(params: ProcessWebhookParams): Promise<WebhookResponse> {
    if (this.isMock) {
      // Mock webhook processing
      return {
        success: true,
        transactionId: params.payload?.transaction_id || params.payload?.id,
        status: 'COMPLETED',
        message: 'Mock webhook processed successfully',
      };
    }

    // Validate signature
    if (!this.validateWebhookSignature(params.payload, params.signature || '')) {
      return {
        success: false,
        message: 'Invalid webhook signature',
      };
    }

    // Process webhook based on DeUNA's webhook structure
    const status = params.payload.status || params.payload.event;
    const transactionId = params.payload.transaction_id || params.payload.id;

    let transactionStatus = 'PENDING';
    if (status === 'paid' || status === 'completed' || status === 'payment.completed') {
      transactionStatus = 'COMPLETED';
    } else if (status === 'failed' || status === 'payment.failed') {
      transactionStatus = 'FAILED';
    }

    return {
      success: true,
      transactionId,
      status: transactionStatus,
      message: 'Webhook processed successfully',
    };
  }

  validateWebhookSignature(payload: any, signature: string): boolean {
    if (this.isMock) {
      return true; // Skip validation in mock mode
    }

    try {
      // DeUNA typically uses HMAC SHA256
      const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payloadString)
        .digest('hex');

      // Compare signatures (constant-time comparison)
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      return false;
    }
  }
}

