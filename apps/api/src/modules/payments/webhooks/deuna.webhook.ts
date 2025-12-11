import { Injectable } from '@nestjs/common';
import { DeunaGateway } from '../gateways/deuna.gateway';
import { PaymentsService } from '../payments.service';

@Injectable()
export class DeunaWebhook {
  constructor(
    private readonly deunaGateway: DeunaGateway,
    private readonly paymentsService: PaymentsService,
  ) {}

  async handleWebhook(payload: any, signature?: string) {
    // Validate and process webhook
    const webhookResult = await this.deunaGateway.processWebhook({
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

