import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly twilioAccountSid: string;
  private readonly twilioAuthToken: string;
  private readonly twilioWhatsAppNumber: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.twilioAccountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID') || '';
    this.twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN') || '';
    this.twilioWhatsAppNumber = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER') || '';

    // WhatsApp is enabled only if all credentials are configured
    this.enabled = !!(this.twilioAccountSid && this.twilioAuthToken && this.twilioWhatsAppNumber);

    if (!this.enabled) {
      this.logger.warn('WhatsApp integration is disabled. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER to enable.');
    } else {
      this.logger.log('WhatsApp integration is enabled');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Send passenger form link via WhatsApp
   */
  async sendPassengerFormLink(
    phoneNumber: string,
    customerName: string,
    bookingReference: string,
    passengerFormUrl: string,
    tripInfo: {
      origin: string;
      destination: string;
      serviceName: string;
      departureDate: string;
      departureTime: string;
    },
  ): Promise<{ success: boolean; whatsappUrl?: string; error?: string }> {
    if (!this.enabled) {
      this.logger.warn('WhatsApp is not enabled. Skipping message send.');
      return {
        success: false,
        error: 'WhatsApp integration is not configured',
      };
    }

    try {
      // Format phone number for WhatsApp (must start with country code)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Create message
      const message = this.buildPassengerFormMessage(
        customerName,
        bookingReference,
        passengerFormUrl,
        tripInfo,
      );

      // Send via Twilio WhatsApp API
      const result = await this.sendTwilioWhatsAppMessage(formattedPhone, message);

      if (result.success) {
        this.logger.log(`WhatsApp sent successfully to ${formattedPhone} for booking ${bookingReference}`);

        // Generate WhatsApp web URL for click-to-chat
        const whatsappUrl = `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;

        return {
          success: true,
          whatsappUrl,
        };
      } else {
        return result;
      }
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${phoneNumber}: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send WhatsApp message via Twilio API
   */
  private async sendTwilioWhatsAppMessage(
    to: string,
    message: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Twilio WhatsApp API endpoint
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`;

      // Prepare request body
      const params = new URLSearchParams();
      params.append('From', `whatsapp:${this.twilioWhatsAppNumber}`);
      params.append('To', `whatsapp:${to}`);
      params.append('Body', message);

      // Send request with basic auth
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64'),
        },
        body: params,
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(`Twilio API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      this.logger.debug(`Twilio response: ${JSON.stringify(data)}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Twilio API request failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Format phone number to international format
   * Assumes Ecuador (+593) if no country code is provided
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, remove it (Ecuador local format)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // If doesn't start with country code, add Ecuador's (+593)
    if (!cleaned.startsWith('593')) {
      cleaned = '593' + cleaned;
    }

    return '+' + cleaned;
  }

  /**
   * Build passenger form message template
   */
  private buildPassengerFormMessage(
    customerName: string,
    bookingReference: string,
    passengerFormUrl: string,
    tripInfo: {
      origin: string;
      destination: string;
      serviceName: string;
      departureDate: string;
      departureTime: string;
    },
  ): string {
    return `
¡Hola ${customerName}! 👋

Tu reserva ha sido confirmada exitosamente.

📋 *Referencia:* ${bookingReference}
🚌 *Servicio:* ${tripInfo.serviceName}
📍 *Ruta:* ${tripInfo.origin} → ${tripInfo.destination}
📅 *Fecha:* ${new Date(tripInfo.departureDate).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}
🕐 *Hora:* ${tripInfo.departureTime}

⚠️ *IMPORTANTE:* Para completar tu reserva, necesitamos los datos de los pasajeros.

👉 Completa el formulario aquí:
${passengerFormUrl}

Este enlace es válido por 72 horas.

Si tienes alguna duda, no dudes en contactarnos.

¡Buen viaje! 🚌✨
    `.trim();
  }
}
