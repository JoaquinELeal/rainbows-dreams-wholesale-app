import { json, type LoaderFunctionArgs } from "@remix-run/node";

import { verifyApprovalToken } from "../utils/tokens.server";
import { getRegistrationById, updateRegistration } from "../services/registration.server";
import { updateCustomerStatus, triggerShopifyFlow } from "../services/wholesale.server";
import { sendCustomerRejectionEmail } from "../services/email.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return json({ error: "Missing rejection token" }, { status: 400 });
  }

  try {
    // Verify the token
    const tokenPayload = verifyApprovalToken(token);
    if (!tokenPayload || tokenPayload.action !== 'reject') {
      return json({ error: "Invalid or expired rejection token" }, { status: 400 });
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
    await updateCustomerStatus(request, tokenPayload.shopifyCustomerId, 'rejected');

    // Update registration in database
    await updateRegistration(registration.id, { status: 'REJECTED' });

    // Trigger Shopify Flow (optional)
    await triggerShopifyFlow(request, tokenPayload.shopifyCustomerId, 'rejected');

    // Send rejection email to customer
    await sendCustomerRejectionEmail(registration.email, registration.name);

    // Return success response with HTML page
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Rejected</title>
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
          .reject-icon {
            width: 60px;
            height: 60px;
            background: #dc3545;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .reject-icon svg {
            fill: white;
          }
          h1 {
            color: #dc3545;
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
          <div class="reject-icon">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </div>
          <h1>Application Rejected</h1>
          <p>The wholesale application has been rejected.</p>
          <div class="customer-info">
            <strong>Customer:</strong> ${registration.name}<br>
            <strong>Email:</strong> ${registration.email}
          </div>
          <p>The customer has been notified via email about this decision.</p>
        </div>
      </body>
      </html>
    `, {
      headers: {
        "Content-Type": "text/html",
      },
    });

  } catch (error) {
    console.error("Rejection error:", error);
    return json({ error: "Failed to process rejection" }, { status: 500 });
  }
}
