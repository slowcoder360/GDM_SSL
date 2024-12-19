import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail({ to, subject, text }: SendEmailParams) {
  const msg = {
    to,
    from: "Justin@greydotmedia.com",
    subject,
    text,
  };

  await sendgrid.send(msg);
}
