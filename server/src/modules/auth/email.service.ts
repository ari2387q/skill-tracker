import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
export const sendVerificationEmail=async(
  to: string,
  rawToken: string
): Promise<void> =>{
  // Build the link the user will click. This points to your frontend,which will then call your backend's verify-email API endpoint.
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

  // Call Resend's send API.
  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev", // free test sender — swap for your own domain later
    to,
    subject: "Verify your email",
    html: `
      <div>
        <h2>Verify your email</h2>
        <p>Click the link below to verify your account. This link expires in 1 hour.</p>
        <a href="${verificationLink}">Verify Email</a>
      </div>
    `,
  });
  if (error) {
    console.error("RESEND ERROR:", error);
    throw new Error("Failed to send verification email");
  }
};