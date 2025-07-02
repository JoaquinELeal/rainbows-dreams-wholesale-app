import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export default function WholesaleConfirmation() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Thank You!
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Your wholesale application has been submitted successfully.
            </p>
            
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="text-sm text-blue-800">
                <h3 className="font-medium">What happens next?</h3>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>We'll review your application within 1-2 business days</li>
                  <li>You'll receive an email notification with our decision</li>
                  <li>If approved, you'll gain access to wholesale pricing</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Homepage
              </Link>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>
                Questions? Contact us at{" "}
                <a href="mailto:wholesale@example.com" className="text-indigo-600 hover:text-indigo-500">
                  wholesale@example.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
