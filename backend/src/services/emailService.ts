import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Configuration du transporteur email
const createTransporter = () => {
   return nodemailer.createTransport({    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true pour 465, false pour les autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
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
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
};

// Template d'email de bienvenue
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
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

  await sendEmail({
    to,
    subject: 'Bienvenue sur ProgiTek',
    html
  });
};

// Template d'email de notification
export const sendNotificationEmail = async (
  to: string, 
  subject: string, 
  message: string
): Promise<void> => {
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

  await sendEmail({
    to,
    subject,
    html
  });
};