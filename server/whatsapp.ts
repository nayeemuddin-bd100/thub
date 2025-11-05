interface WhatsAppMessage {
  to: string;
  body: string;
}

interface WhatsAppResponse {
  success: boolean;
  messageSid?: string;
  error?: string;
}

export class WhatsAppService {
  private accountSid: string | undefined;
  private authToken: string | undefined;
  private whatsappNumber: string | undefined;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  }

  isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.whatsappNumber);
  }

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    if (!this.isConfigured()) {
      console.warn('WhatsApp service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER environment variables.');
      return {
        success: false,
        error: 'WhatsApp service not configured'
      };
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${this.whatsappNumber}`,
            To: `whatsapp:${message.to}`,
            Body: message.body,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp send error:', errorData);
        return {
          success: false,
          error: errorData.message || 'Failed to send WhatsApp message'
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageSid: data.sid
      };
    } catch (error) {
      console.error('WhatsApp service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  formatWhatsAppNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  getWhatsAppLink(phoneNumber: string, message?: string): string {
    // Always use business WhatsApp number and open in web view
    const businessNumber = '18495815558';
    
    if (message) {
      return `https://web.whatsapp.com/send?phone=${businessNumber}&text=${encodeURIComponent(message)}`;
    }
    return `https://web.whatsapp.com/send?phone=${businessNumber}`;
  }
}

export const whatsappService = new WhatsAppService();
