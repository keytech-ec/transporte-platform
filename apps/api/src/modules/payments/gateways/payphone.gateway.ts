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
export class PayphoneGateway implements IPaymentGateway {
  gateway = PaymentGateway.PAYPHONE;
  private token: string;
  private storeId: string;
  private webhookSecret: string;
  private baseUrl: string;
  private isMock: boolean;

  constructor(private configService: ConfigService) {
    this.token = this.configService.get<string>('PAYPHONE_TOKEN') || '';
    this.storeId = this.configService.get<string>('PAYPHONE_STORE_ID') || '';
    this.webhookSecret = this.configService.get<string>('PAYPHONE_WEBHOOK_SECRET') || '';
    this.baseUrl = this.configService.get<string>('PAYPHONE_BASE_URL') || 'https://pay.payphonetodoesposible.com';
    this.isMock = !this.token || !this.storeId || !this.webhookSecret;
  }

  async createPaymentLink(
    params: CreatePaymentLinkParams,
  ): Promise<CreatePaymentLinkResponse> {
    if (this.isMock) {
      // Mock implementation for MVP
      const mockTransactionId = `payphone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockPaymentUrl = `https://pay.payphonetodoesposible.com/mock/${mockTransactionId}`;

      // Simulate async confirmation after 5 seconds
      setTimeout(() => {
        // This would be handled by the webhook in a real scenario
        console.log(`[MOCK] Payphone payment would be confirmed for transaction: ${mockTransactionId}`);
      }, 5000);

      return {
        paymentUrl: mockPaymentUrl,
        transactionId: mockTransactionId,
        gatewayTransactionId: mockTransactionId,
      };
    }

    // Real implementation
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/charges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency || 'USD',
          reference: params.reservationId,
          store_id: this.storeId,
          customer: {
            email: params.customerEmail,
            name: params.customerName,
          },
          metadata: params.metadata,
          return_url: `${this.configService.get<string>('APP_URL')}/payments/success`,
          cancel_url: `${this.configService.get<string>('APP_URL')}/payments/cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Payphone API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        paymentUrl: data.payment_url || data.url,
        transactionId: data.transaction_id || data.id,
        gatewayTransactionId: data.id,
      };
    } catch (error) {
      throw new Error(`Failed to create Payphone payment link: ${error.message}`);
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

    // Process webhook based on Payphone's webhook structure
    const status = params.payload.status || params.payload.state;
    const transactionId = params.payload.transaction_id || params.payload.id;

    let transactionStatus = 'PENDING';
    if (status === 'approved' || status === 'completed' || status === 'paid') {
      transactionStatus = 'COMPLETED';
    } else if (status === 'rejected' || status === 'failed' || status === 'declined') {
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
      // Payphone typically uses HMAC SHA256
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

