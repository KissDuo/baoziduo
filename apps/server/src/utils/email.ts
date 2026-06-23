import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = '宝子多EN <noreply@dtzhuanjia.com>';

export async function sendVerificationEmail(to: string, code: string) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: '宝子多EN - 邮箱验证码',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #4f46e5; margin: 0 0 16px;">宝子多EN</h2>
        <p style="font-size: 16px; color: #1e293b;">你的邮箱验证码是：</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">验证码 5 分钟内有效，请勿转发给他人。</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">宝子多EN - 英语学习平台</p>
      </div>
    `,
  });

  if (error) {
    console.error('[Resend] Failed to send email:', error);
    throw new Error('Failed to send verification email');
  }

  return data;
}
