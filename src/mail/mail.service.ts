import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  async sendResetPasswordEmail(email: string, code: string) {
    await this.resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
      <h2>Recuperación de contraseña</h2>

      <p>Tu código de verificación es:</p>

      <h1>${code}</h1>

      <p>Este código expira en 15 minutos.</p>

      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `,
    });
  }
}
