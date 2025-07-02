import { json, type LoaderFunctionArgs } from "@remix-run/node";

import { verifyApprovalToken } from "../utils/tokens.server";
import { getRegistrationById, updateRegistration } from "../services/registration.server";
import { updateCustomerStatus, triggerShopifyFlow } from "../services/wholesale.server";
import { sendCustomerApprovalEmail } from "../services/email.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return json({ error: "Missing approval token" }, { status: 400 });
  }

  try {
    // Verify the token
    const tokenPayload = verifyApprovalToken(token);
    if (!tokenPayload || tokenPayload.action !== 'approve') {
      return json({ error: "Invalid or expired approval token" }, { status: 400 });
    }

    // Get the registration
    const registration = await getRegistrationById(tokenPayload.registrationId);
    if (!registration) {
      return json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.status !== 'PENDING') {
      return json({ 
        error: "This registration has already been processed",
        status: registration.status.toLowerCase()
      }, { status: 400 });
    }

    // Update Shopify customer
    await updateCustomerStatus(request, tokenPayload.shopifyCustomerId, 'approved');

    // Update registration in database
    await updateRegistration(registration.id, { status: 'APPROVED' });

    // Trigger Shopify Flow (optional)
    await triggerShopifyFlow(request, tokenPayload.shopifyCustomerId, 'approved');

    // Send approval email to customer
    await sendCustomerApprovalEmail(registration.email, registration.name);

    // Return success response with HTML page
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Approved</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px 20px;
            background-color: #f8f9fa;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .success-icon {
            width: 60px;
            height: 60px;
            background: #28a745;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .success-icon svg {
            fill: white;
          }
          h1 {
            color: #28a745;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            line-height: 1.6;
          }
          .customer-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <h1>Application Approved!</h1>
          <p>The wholesale application has been successfully approved.</p>
          <div class="customer-info">
            <strong>Customer:</strong> ${registration.name}<br>
            <strong>Email:</strong> ${registration.email}
          </div>
          <p>The customer has been notified via email and their account has been updated with wholesale access.</p>
        </div>
      </body>
      </html>
    `, {
      headers: {
        "Content-Type": "text/html",
      },
    });

  } catch (error) {
    console.error("Approval error:", error);
    return json({ error: "Failed to process approval" }, { status: 500 });
  }
}
