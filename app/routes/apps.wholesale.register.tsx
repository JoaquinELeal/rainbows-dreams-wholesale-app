import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { createWholesaleCustomer } from "../services/wholesale.server";
import { createRegistration } from "../services/registration.server";
import { sendMerchantNotification } from "../services/email.server";
import { generateApprovalToken } from "../utils/tokens.server";

interface ActionData {
  success?: boolean;
  error?: string;
  redirectUrl?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle GET requests - could serve a JSON response or redirect
  return json({ message: "Wholesale registration endpoint" });
}

export async function action({ request }: ActionFunctionArgs) {
  // This endpoint can be used as an app proxy for public access
  // Configure in Shopify Admin: Apps > [Your App] > App setup > App proxy
  // Subpath: wholesale, Subpath prefix: apps

  try {
    const formData = await request.formData();
    
    // Extract form fields
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const companyName = formData.get("companyName") as string;
    const website = formData.get("website") as string;
    const businessType = formData.get("businessType") as string;
    const businessAddress = formData.get("businessAddress") as string;
    const taxId = formData.get("taxId") as string;
    const expectedVolume = formData.get("expectedVolume") as string;
    const businessDescription = formData.get("businessDescription") as string;
    const hearAboutUs = formData.get("hearAboutUs") as string;
    const agreeTerms = formData.get("agreeTerms") === "on";
    const subscribeUpdates = formData.get("subscribeUpdates") === "on";

    // Validation
    if (!firstName || !lastName || !email || !companyName || !businessType || !businessAddress || !businessDescription || !expectedVolume) {
      return json<ActionData>({ 
        error: "Please fill in all required fields." 
      }, { status: 400 });
    }

    if (!agreeTerms) {
      return json<ActionData>({ 
        error: "You must agree to the terms and conditions." 
      }, { status: 400 });
    }

    if (!email.includes("@")) {
      return json<ActionData>({ 
        error: "Please enter a valid email address." 
      }, { status: 400 });
    }

    // Build full name and detailed business info
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const businessDetails = JSON.stringify({
      companyName: companyName.trim(),
      businessType,
      businessAddress: businessAddress.trim(),
      website: website?.trim() || '',
      phone: phone?.trim() || '',
      taxId: taxId?.trim() || '',
      expectedVolume,
      businessDescription: businessDescription.trim(),
      hearAboutUs: hearAboutUs || '',
      subscribeUpdates,
      submittedAt: new Date().toISOString()
    });

    // Create customer in Shopify
    const shopifyCustomer = await createWholesaleCustomer(request, {
      name: fullName,
      email: email.trim(),
      businessDetails
    });

    // Store registration in database
    const registration = await createRegistration({
      shopifyCustomerId: shopifyCustomer.id,
      name: fullName,
      email: email.trim(),
      businessDetails
    });

    // Generate approval/rejection tokens
    const approveToken = generateApprovalToken({
      registrationId: registration.id,
      action: 'approve',
      shopifyCustomerId: shopifyCustomer.id,
    });

    const rejectToken = generateApprovalToken({
      registrationId: registration.id,
      action: 'reject',
      shopifyCustomerId: shopifyCustomer.id,
    });

    // Get the base URL for approval links
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    const approveUrl = `${baseUrl}/api/approve?token=${approveToken}`;
    const rejectUrl = `${baseUrl}/api/reject?token=${rejectToken}`;

    // Send email notification to merchant
    await sendMerchantNotification({
      registration: {
        name: fullName,
        email: email.trim(),
        businessDetails: JSON.stringify({
          companyName,
          businessType,
          businessAddress,
          phone,
          website,
          expectedVolume,
          businessDescription
        }, null, 2)
      },
      approveUrl,
      rejectUrl,
    });

    // Return success with redirect URL
    return json<ActionData>({ 
      success: true,
      redirectUrl: "/pages/wholesale-confirmation"
    });

  } catch (error) {
    console.error("Public registration error:", error);
    return json<ActionData>(
      { error: "Failed to process registration. Please try again later." },
      { status: 500 }
    );
  }
}

// Default export for the public endpoint
export default function PublicWholesaleRegister() {
  return null; // This won't be rendered since it's an API endpoint
}
