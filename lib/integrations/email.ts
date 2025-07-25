import sgMail from '@sendgrid/mail'
import nodemailer from 'nodemailer'

// Only set API key if it exists and is valid
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else if (process.env.SENDGRID_API_KEY) {
  console.warn('Invalid SendGrid API key format. API key should start with "SG."')
}

export interface EmailData {
  to: string | string[]
  from?: string
  subject: string
  html?: string
  text?: string
  templateId?: string
  dynamicTemplateData?: any
  attachments?: Array<{
    content: string
    filename: string
    type?: string
    disposition?: string
  }>
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  variables: string[]
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    // Backup SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      if (process.env.EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY?.startsWith('SG.')) {
        return await this.sendWithSendGrid(data)
      } else {
        return await this.sendWithSMTP(data)
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }

  private async sendWithSendGrid(data: EmailData): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY?.startsWith('SG.')) {
        throw new Error('Invalid or missing SendGrid API key')
      }

      const msg = {
        to: data.to,
        from: data.from || process.env.FROM_EMAIL!,
        subject: data.subject,
        html: data.html,
        text: data.text,
        templateId: data.templateId,
        dynamicTemplateData: data.dynamicTemplateData,
        attachments: data.attachments,
      }

      await sgMail.send(msg as any)
      return true
    } catch (error) {
      console.error('SendGrid email failed:', error)
      throw error
    }
  }

  private async sendWithSMTP(data: EmailData): Promise<boolean> {
    try {
      // Skip SMTP if not configured
      if (!process.env.SMTP_HOST) {
        console.log('SMTP not configured, skipping email send:', data.subject)
        return true // Return true to not break the flow
      }

      const mailOptions = {
        from: data.from || process.env.FROM_EMAIL!,
        to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
        attachments: data.attachments?.map(att => ({
          filename: att.filename,
          content: Buffer.from(att.content, 'base64'),
          contentType: att.type,
        })),
      }

      await this.transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error('SMTP email failed:', error)
      throw error
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: 'Welkom bij WattVrij!',
      templateId: 'welcome-template',
      dynamicTemplateData: {
        name: userName,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      },
    })
  }

  async sendOrderConfirmation(
    userEmail: string, 
    orderData: any
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: `Bevestiging bestelling ${orderData.orderNumber}`,
      templateId: 'order-confirmation-template',
      dynamicTemplateData: {
        orderNumber: orderData.orderNumber,
        items: orderData.items,
        total: orderData.total,
        trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderData.id}`,
      },
    })
  }

  async sendOfferNotification(
    userEmail: string,
    offerData: any
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: 'Nieuw bod ontvangen op je woning',
      templateId: 'offer-notification-template',
      dynamicTemplateData: {
        propertyAddress: offerData.propertyAddress,
        offerAmount: offerData.amount,
        buyerName: offerData.buyerName,
        viewOfferUrl: `${process.env.NEXT_PUBLIC_APP_URL}/offers/${offerData.id}`,
      },
    })
  }

  async sendPaymentConfirmation(
    userEmail: string,
    paymentData: any
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: 'Betaling bevestigd',
      templateId: 'payment-confirmation-template',
      dynamicTemplateData: {
        amount: paymentData.amount,
        currency: paymentData.currency,
        transactionId: paymentData.transactionId,
        receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/receipts/${paymentData.id}`,
      },
    })
  }

  async sendPasswordReset(userEmail: string, resetToken: string): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: 'Wachtwoord reset - WattVrij',
      templateId: 'password-reset-template',
      dynamicTemplateData: {
        resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
        expiryTime: '24 uur',
      },
    })
  }

  async sendInvoice(
    userEmail: string,
    invoiceData: any,
    pdfAttachment: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: `Factuur ${invoiceData.invoiceNumber}`,
      templateId: 'invoice-template',
      dynamicTemplateData: {
        invoiceNumber: invoiceData.invoiceNumber,
        amount: invoiceData.amount,
        dueDate: invoiceData.dueDate,
      },
      attachments: [{
        content: pdfAttachment,
        filename: `factuur-${invoiceData.invoiceNumber}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      }],
    })
  }
}

export const emailService = new EmailService()