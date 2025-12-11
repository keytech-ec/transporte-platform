import { Injectable } from '@nestjs/common';
import { PayphoneGateway } from '../gateways/payphone.gateway';
import { PaymentsService } from '../payments.service';

@Injectable()
export class PayphoneWebhook {
  constructor(
    private readonly payphoneGateway: PayphoneGateway,
    private readonly paymentsService: PaymentsService,
  ) {}

  async handleWebhook(payload: any, signature?: string) {
    // Validate and process webhook
    const webhookResult = await this.payphoneGateway.processWebhook({
      payload,
      signature,
    });

    if (!webhookResult.success) {
      throw new Error(webhookResult.message || 'Webhook validation failed');
    }

    // Update transaction status
    if (webhookResult.transactionId) {
      await this.paymentsService.updateTransactionFromWebhook(
        webhookResult.transactionId,
        webhookResult.status || 'PENDING',
        payload,
      );
    }

    return webhookResult;
  }
}

