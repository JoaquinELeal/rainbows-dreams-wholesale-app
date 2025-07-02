import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const MERCHANT_EMAIL = process.env.MERCHANT_EMAIL || 'merchant@example.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@example.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface RegistrationData {
  name: string;
  email: string;
  businessDetails: string;
}

export interface EmailNotificationData {
  registration: RegistrationData;
  approveUrl: string;
  rejectUrl: string;
}

export async function sendMerchantNotification(data: EmailNotificationData) {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email not sent.');
    return;
  }

  const { registration, approveUrl, rejectUrl } = data;

  const msg = {
    to: MERCHANT_EMAIL,
    from: FROM_EMAIL,
    subject: `New Wholesale Registration: ${registration.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Wholesale Registration Request</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Customer Details:</h3>
          <p><strong>Name:</strong> ${registration.name}</p>
          <p><strong>Email:</strong> ${registration.email}</p>
          <p><strong>Business Details:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${registration.businessDetails}</div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${approveUrl}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px; display: inline-block;">
            ✅ Approve
          </a>
          <a href="${rejectUrl}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px; display: inline-block;">
            ❌ Reject
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          These links will expire in 7 days. Please review and respond to this wholesale registration request.
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Merchant notification email sent successfully');
  } catch (error) {
    console.error('Error sending merchant notification email:', error);
    throw error;
  }
}

export async function sendCustomerApprovalEmail(customerEmail: string, customerName: string) {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email not sent.');
    return;
  }

  const msg = {
    to: customerEmail,
    from: FROM_EMAIL,
    subject: 'Your Wholesale Application Has Been Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎉 Congratulations, ${customerName}!</h2>
        
        <p>We're excited to let you know that your wholesale application has been approved!</p>
        
        <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What's Next?</h3>
          <ul>
            <li>You now have access to wholesale pricing</li>
            <li>Log in to your account to see your exclusive pricing</li>
            <li>Start placing your wholesale orders</li>
          </ul>
        </div>

        <p>Thank you for choosing us as your wholesale partner. We look forward to a successful business relationship!</p>
        
        <p>
          Best regards,<br>
          The Wholesale Team
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Customer approval email sent successfully');
  } catch (error) {
    console.error('Error sending customer approval email:', error);
    throw error;
  }
}

export async function sendCustomerRejectionEmail(customerEmail: string, customerName: string) {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email not sent.');
    return;
  }

  const msg = {
    to: customerEmail,
    from: FROM_EMAIL,
    subject: 'Update on Your Wholesale Application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your interest, ${customerName}</h2>
        
        <p>Thank you for submitting your wholesale application. After careful review, we're unable to approve your application at this time.</p>
        
        <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>This decision may be based on various factors including:</p>
          <ul>
            <li>Current capacity limitations</li>
            <li>Geographic restrictions</li>
            <li>Minimum order requirements</li>
            <li>Business type compatibility</li>
          </ul>
        </div>

        <p>We appreciate your interest in our products and encourage you to explore our retail offerings on our website.</p>
        
        <p>
          Best regards,<br>
          The Wholesale Team
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Customer rejection email sent successfully');
  } catch (error) {
    console.error('Error sending customer rejection email:', error);
    throw error;
  }
}
