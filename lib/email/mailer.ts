import nodemailer from "nodemailer";

type MailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type GlobalWithMailer = typeof globalThis & {
  vitamindMailer?: nodemailer.Transporter;
};

const globalForMailer = globalThis as GlobalWithMailer;

function getTransportConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !port || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  };
}

export function isMailConfigured() {
  return Boolean(getTransportConfig());
}

function getTransporter() {
  const config = getTransportConfig();
  if (!config) {
    return null;
  }

  if (!globalForMailer.vitamindMailer) {
    globalForMailer.vitamindMailer = nodemailer.createTransport(config);
  }

  return globalForMailer.vitamindMailer;
}

function getFromHeader() {
  const fromAddress = process.env.MAIL_FROM_ADDRESS?.trim() || "support@vitamind.com.vn";
  const fromName = process.env.MAIL_FROM_NAME?.trim() || "Vitamind Support";
  return `"${fromName}" <${fromAddress}>`;
}

export async function sendMail(options: MailOptions) {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error("SMTP chưa được cấu hình.");
  }

  await transporter.sendMail({
    from: getFromHeader(),
    replyTo: process.env.MAIL_REPLY_TO?.trim() || "nhanlt.luunhan@gmail.com",
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

export async function sendPasswordResetCodeEmail(to: string, code: string) {
  const subject = "Mã đặt lại mật khẩu Vitamind";
  const text = [
    "Xin chào,",
    "",
    `Mã đặt lại mật khẩu của bạn là: ${code}`,
    "",
    "Mã có hiệu lực trong 15 phút.",
    "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.",
    "",
    "Vitamind",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #122033;">
      <p>Xin chào,</p>
      <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Vitamind.</p>
      <p style="margin: 24px 0;">
        <span style="display: inline-block; padding: 12px 18px; border-radius: 10px; background: #eef6ff; color: #0f4c81; font-size: 24px; font-weight: 700; letter-spacing: 4px;">
          ${code}
        </span>
      </p>
      <p>Mã có hiệu lực trong <strong>15 phút</strong>.</p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
      <p>Vitamind</p>
    </div>
  `;

  await sendMail({ to, subject, text, html });
}
