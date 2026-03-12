import nodemailer from 'nodemailer';
import { env } from '../config/env';

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: env.NODE_ENV === 'production' ? true : false,
    auth: {
      user: env.auth_user_email,
      pass: env.auth_user_email_password,
    },
  });

  await transporter.sendMail({
    from: env.auth_user_email,
    to,
    subject,
    text,
    html,
  });
};
