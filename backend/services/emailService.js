const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const APIConfiguration = require('../models/APIConfiguration');

class EmailService {
  constructor() {
    this.config = null;
    this.transporter = null;
  }

  // Load configuration from database
  async loadConfig() {
    const apiConfig = await APIConfiguration.getConfiguration();
    this.config = apiConfig.getDecrypted().email;
    return this.config;
  }

  // Create SMTP transporter
  async createTransporter() {
    if (!this.config) await this.loadConfig();

    const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword } = this.config;

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });

    return this.transporter;
  }

  // Send email via SMTP/Gmail
  async sendViaSMTP(to, subject, html, text) {
    if (!this.transporter) await this.createTransporter();

    const { fromEmail, fromName } = this.config;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      text: text,
      html: html
    };

    const result = await this.transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  }

  // Send email via SendGrid
  async sendViaSendGrid(to, subject, html, text) {
    if (!this.config) await this.loadConfig();

    const { apiKey, fromEmail, fromName } = this.config;

    if (!apiKey) {
      throw new Error('SendGrid API key is missing');
    }

    sgMail.setApiKey(apiKey);

    const msg = {
      to: Array.isArray(to) ? to : [to],
      from: {
        email: fromEmail,
        name: fromName
      },
      subject: subject,
      text: text,
      html: html
    };

    const result = await sgMail.send(msg);

    return {
      success: true,
      messageId: result[0].headers['x-message-id'],
      statusCode: result[0].statusCode
    };
  }

  // Main send method
  async sendEmail(to, subject, html, text = '') {
    try {
      if (!this.config) await this.loadConfig();

      if (!this.config.enabled) {
        console.log('Email service is disabled');
        return { success: false, message: 'Email service is disabled' };
      }

      // If no text version provided, strip HTML for text version
      if (!text && html) {
        text = html.replace(/<[^>]*>/g, '');
      }

      let result;
      if (this.config.provider === 'smtp' || this.config.provider === 'gmail') {
        result = await this.sendViaSMTP(to, subject, html, text);
      } else if (this.config.provider === 'sendgrid') {
        result = await this.sendViaSendGrid(to, subject, html, text);
      } else {
        throw new Error('Invalid email provider');
      }

      console.log(`Email sent successfully to ${to} via ${this.config.provider}`);
      return result;
    } catch (error) {
      console.error('Email send error:', error.message);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    try {
      if (!this.config) await this.loadConfig();

      if (this.config.provider === 'smtp' || this.config.provider === 'gmail') {
        if (!this.transporter) await this.createTransporter();
        await this.transporter.verify();
        return { success: true, message: 'SMTP connection successful' };
      } else if (this.config.provider === 'sendgrid') {
        const { apiKey } = this.config;
        if (!apiKey) throw new Error('SendGrid API key missing');
        sgMail.setApiKey(apiKey);
        // SendGrid doesn't have a verify endpoint, so we just check if API key exists
        return { success: true, message: 'SendGrid API key configured' };
      }
    } catch (error) {
      throw new Error(`Email test failed: ${error.message}`);
    }
  }

  // Send HTML email with template
  async sendTemplateEmail(to, subject, templateData) {
    const html = this.generateEmailTemplate(templateData);
    return this.sendEmail(to, subject, html);
  }

  // Generate basic email template
  generateEmailTemplate({ title, body, buttonText, buttonUrl }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title || 'Blood Bank Network'}</h1>
          </div>
          <div class="content">
            ${body}
            ${buttonText && buttonUrl ? `<a href="${buttonUrl}" class="button">${buttonText}</a>` : ''}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Blood Bank Network. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send bulk emails
  async sendBulkEmails(recipients, subject, html, text) {
    const results = [];
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(recipient, subject, html, text);
        results.push({ recipient, success: true, result });
      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }
    return results;
  }
}

module.exports = new EmailService();

