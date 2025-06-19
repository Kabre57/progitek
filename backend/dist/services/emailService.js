"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationEmail = exports.sendWelcomeEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createTransporter = () => {
    return nodemailer_1.default.createTransport({ host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: {
                name: process.env.FROM_NAME || 'ProgiTek System',
                address: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@progitek.com'
            },
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email envoyé:', info.messageId);
        if (process.env.NODE_ENV === 'development') {
            console.log('📧 Preview URL:', nodemailer_1.default.getTestMessageUrl(info));
        }
    }
    catch (error) {
        console.error('❌ Erreur envoi email:', error);
        throw new Error('Erreur lors de l\'envoi de l\'email');
    }
};
exports.sendEmail = sendEmail;
const sendWelcomeEmail = async (to, name) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bienvenue sur ProgiTek</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bienvenue sur ProgiTek</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${name},</h2>
          <p>Votre compte ProgiTek a été créé avec succès !</p>
          <p>Vous pouvez maintenant accéder à la plateforme de gestion des interventions techniques.</p>
          <p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">
              Accéder à ProgiTek
            </a>
          </p>
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          <p>Cordialement,<br>L'équipe ProgiTek</p>
        </div>
      </div>
    </body>
    </html>
  `;
    await (0, exports.sendEmail)({
        to,
        subject: 'Bienvenue sur ProgiTek',
        html
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendNotificationEmail = async (to, subject, message) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ProgiTek - Notification</h1>
        </div>
        <div class="content">
          <h2>${subject}</h2>
          <p>${message}</p>
          <p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Voir sur ProgiTek
            </a>
          </p>
          <p>Cordialement,<br>L'équipe ProgiTek</p>
        </div>
      </div>
    </body>
    </html>
  `;
    await (0, exports.sendEmail)({
        to,
        subject,
        html
    });
};
exports.sendNotificationEmail = sendNotificationEmail;
//# sourceMappingURL=emailService.js.map