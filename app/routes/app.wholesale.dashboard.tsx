import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

import { authenticate } from "../shopify.server";
import { getAllPendingRegistrations, getRegistrationStats, updateRegistration, getRegistrationById } from "../services/registration.server";
import { updateCustomerStatus, triggerShopifyFlow } from "../services/wholesale.server";
import { sendCustomerApprovalEmail, sendCustomerRejectionEmail } from "../services/email.server";

interface LoaderData {
  pendingRegistrations: Awaited<ReturnType<typeof getAllPendingRegistrations>>;
  stats: Awaited<ReturnType<typeof getRegistrationStats>>;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Authenticate admin user
  await authenticate.admin(request);

  const [pendingRegistrations, stats] = await Promise.all([
    getAllPendingRegistrations(),
    getRegistrationStats(),
  ]);

  return json<LoaderData>({
    pendingRegistrations,
    stats,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action") as string;
  const registrationId = formData.get("registrationId") as string;

  if (!action || !registrationId) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Get the registration
    const registration = await getRegistrationById(parseInt(registrationId));
    if (!registration) {
      return json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.status !== 'PENDING') {
      return json({ error: "Registration has already been processed" }, { status: 400 });
    }

    // Update customer in Shopify
    const status = action === 'approve' ? 'approved' : 'rejected';
    await updateCustomerStatus(request, registration.shopifyCustomerId, status);

    // Update registration in database
    await updateRegistration(registration.id, {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED'
    });

    // Trigger Shopify Flow (optional)
    await triggerShopifyFlow(request, registration.shopifyCustomerId, status);

    // Send customer notification email
    if (action === 'approve') {
      await sendCustomerApprovalEmail(registration.email, registration.name);
    } else {
      await sendCustomerRejectionEmail(registration.email, registration.name);
    }

    return json({ success: true, action, registrationId });
  } catch (error) {
    console.error(`Error ${action}ing registration:`, error);
    return json({ error: `Failed to ${action} registration` }, { status: 500 });
  }
}

export default function WholesaleDashboard() {
  const { pendingRegistrations, stats } = useLoaderData<LoaderData>();
  const actionFetcher = useFetcher();

  // Show success message if action was processed
  const actionData = actionFetcher.data as { success?: boolean; action?: string } | undefined;
  const showSuccess = actionData?.success;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Success notification */}
      {showSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Registration {actionData.action === 'approve' ? 'approved' : 'rejected'} successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wholesale Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage wholesale registration applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">All</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">⏳</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.approved}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✗</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.rejected}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Applications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Pending Applications ({pendingRegistrations.length})
          </h3>
          
          {pendingRegistrations.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
              <p className="mt-1 text-sm text-gray-500">
                All wholesale applications have been processed.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingRegistrations.map((registration) => {
                      const isProcessing = actionFetcher.state === 'submitting';
                      
                      return (
                        <tr key={registration.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {registration.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {registration.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(registration.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            <div className="truncate" title={registration.businessDetails || ''}>
                              {registration.businessDetails}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <actionFetcher.Form method="post">
                                <input type="hidden" name="action" value="approve" />
                                <input type="hidden" name="registrationId" value={registration.id} />
                                <button
                                  type="submit"
                                  disabled={isProcessing}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isProcessing ? 'Processing...' : '✓ Approve'}
                                </button>
                              </actionFetcher.Form>
                              <actionFetcher.Form method="post">
                                <input type="hidden" name="action" value="reject" />
                                <input type="hidden" name="registrationId" value={registration.id} />
                                <button
                                  type="submit"
                                  disabled={isProcessing}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isProcessing ? 'Processing...' : '✗ Reject'}
                                </button>
                              </actionFetcher.Form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="text-sm text-blue-800">
          <h3 className="font-medium">How to process applications:</h3>
          <ol className="mt-2 list-decimal list-inside space-y-1">
            <li>Review applications in your email notifications</li>
            <li>Click "Approve" or "Reject" buttons in the email</li>
            <li>Customers will be automatically notified of your decision</li>
            <li>Approved customers will gain wholesale access immediately</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
