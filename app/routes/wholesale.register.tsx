import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";

import { createWholesaleCustomer } from "../services/wholesale.server";
import { createRegistration } from "../services/registration.server";
import { sendMerchantNotification } from "../services/email.server";
import { generateApprovalToken } from "../utils/tokens.server";

interface ActionData {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    businessDetails?: string;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const businessDetails = formData.get("businessDetails") as string;

  // Validation
  const fieldErrors: ActionData["fieldErrors"] = {};
  
  if (!name || name.trim().length < 2) {
    fieldErrors.name = "Name must be at least 2 characters long";
  }
  
  if (!email || !email.includes("@")) {
    fieldErrors.email = "Please enter a valid email address";
  }
  
  if (!businessDetails || businessDetails.trim().length < 10) {
    fieldErrors.businessDetails = "Please provide more details about your business (minimum 10 characters)";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return json<ActionData>({ fieldErrors }, { status: 400 });
  }

  try {
    // Create customer in Shopify
    const shopifyCustomer = await createWholesaleCustomer(request, {
      name: name.trim(),
      email: email.trim(),
      businessDetails: businessDetails.trim(),
    });

    // Store registration in database
    const registration = await createRegistration({
      shopifyCustomerId: shopifyCustomer.id,
      name: name.trim(),
      email: email.trim(),
      businessDetails: businessDetails.trim(),
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
        name: name.trim(),
        email: email.trim(),
        businessDetails: businessDetails.trim(),
      },
      approveUrl,
      rejectUrl,
    });

    return json<ActionData>({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return json<ActionData>(
      { error: "Failed to process registration. Please try again." },
      { status: 500 }
    );
  }
}

export default function WholesaleRegister() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessDetails: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (actionData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Application Submitted!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Thank you for your wholesale application. We'll review your information and get back to you within 1-2 business days.
              </p>
              <p className="mt-4 text-xs text-gray-500">
                You'll receive an email confirmation once your application has been reviewed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Wholesale Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Apply to become a wholesale partner
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form method="post" className="space-y-6">
            {actionData?.error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{actionData.error}</div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    actionData?.fieldErrors?.name ? "border-red-300" : "border-gray-300"
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Your full name"
                />
                {actionData?.fieldErrors?.name && (
                  <p className="mt-2 text-sm text-red-600">{actionData.fieldErrors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    actionData?.fieldErrors?.email ? "border-red-300" : "border-gray-300"
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="your@email.com"
                />
                {actionData?.fieldErrors?.email && (
                  <p className="mt-2 text-sm text-red-600">{actionData.fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="businessDetails" className="block text-sm font-medium text-gray-700">
                Business Details *
              </label>
              <div className="mt-1">
                <textarea
                  id="businessDetails"
                  name="businessDetails"
                  rows={4}
                  required
                  value={formData.businessDetails}
                  onChange={(e) => handleInputChange("businessDetails", e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    actionData?.fieldErrors?.businessDetails ? "border-red-300" : "border-gray-300"
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Please describe your business, including type, size, and why you're interested in wholesale purchasing..."
                />
                {actionData?.fieldErrors?.businessDetails && (
                  <p className="mt-2 text-sm text-red-600">{actionData.fieldErrors.businessDetails}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </Form>

          <div className="mt-6">
            <div className="text-xs text-gray-500">
              <p>
                * Required fields. By submitting this form, you agree to our terms and conditions.
                We'll review your application and respond within 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
