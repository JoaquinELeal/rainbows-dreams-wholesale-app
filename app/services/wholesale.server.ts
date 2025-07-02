import { authenticate, unauthenticated } from "../shopify.server";

async function getAdminApi(request: Request) {
  try {
    const { admin } = await authenticate.admin(request);
    return admin;
  } catch (err) {
    console.warn("Authenticated admin failed, falling back to offline admin", err);
    const shop = process.env.SHOP;
    if (!shop) {
      throw new Error("SHOP environment variable is required for offline admin");
    }
    try {
      const { admin } = await unauthenticated.admin({ shop });
      return admin;
    } catch (offlineErr) {
      console.error("Unable to retrieve offline admin API", offlineErr);
      throw offlineErr;
    }
  }
}

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  tags: string[];
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
}

export async function createWholesaleCustomer(
  request: Request,
  customerData: {
    name: string;
    email: string;
    businessDetails: string;
  }
): Promise<ShopifyCustomer> {
  const admin = await getAdminApi(request);

  const [firstName, ...lastNameParts] = customerData.name.trim().split(' ');
  const lastName = lastNameParts.join(' ') || '';

  // Parse business details to create more structured metafields
  let parsedDetails: any = {};
  try {
    parsedDetails = JSON.parse(customerData.businessDetails);
  } catch (e) {
    // If parsing fails, use as-is
    parsedDetails = { description: customerData.businessDetails };
  }

  const mutation = `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
          tags
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      firstName,
      lastName,
      email: customerData.email,
      tags: ['wholesale_pending'],
      phone: parsedDetails.phone || '',
      metafields: [
        {
          namespace: 'wholesale',
          key: 'business_details',
          value: customerData.businessDetails,
          type: 'json'
        },
        {
          namespace: 'wholesale',
          key: 'company_name',
          value: parsedDetails.companyName || '',
          type: 'single_line_text_field'
        },
        {
          namespace: 'wholesale',
          key: 'business_type',
          value: parsedDetails.businessType || '',
          type: 'single_line_text_field'
        },
        {
          namespace: 'wholesale',
          key: 'expected_volume',
          value: parsedDetails.expectedVolume || '',
          type: 'single_line_text_field'
        },
        {
          namespace: 'wholesale',
          key: 'application_date',
          value: new Date().toISOString(),
          type: 'date_time'
        },
        {
          namespace: 'wholesale',
          key: 'application_status',
          value: 'pending',
          type: 'single_line_text_field'
        }
      ]
    }
  };

  try {
    const response = await admin.graphql(mutation, { variables });
    const result = await response.json();

    if (result.data?.customerCreate?.userErrors?.length > 0) {
      throw new Error(`Shopify API error: ${result.data.customerCreate.userErrors[0].message}`);
    }

    return result.data.customerCreate.customer;
  } catch (error) {
    console.error('Error creating Shopify customer:', error);
    throw new Error('Failed to create customer in Shopify');
  }
}

export async function updateCustomerStatus(
  request: Request,
  customerId: string,
  status: 'approved' | 'rejected'
): Promise<ShopifyCustomer> {
  const admin = await getAdminApi(request);

  try {
    // First, get the current customer
    const customerQuery = `
      query getCustomer($id: ID!) {
        customer(id: $id) {
          id
          email
          firstName
          lastName
          tags
        }
      }
    `;

    const customerResponse = await admin.graphql(customerQuery, {
      variables: { id: customerId }
    });
    const customerResult = await customerResponse.json();
    
    if (!customerResult.data?.customer) {
      throw new Error('Customer not found');
    }

    const currentCustomer = customerResult.data.customer;
    
    // Remove wholesale_pending tag and add new status tag
    let tags = currentCustomer.tags || [];
    tags = tags.filter((tag: string) => tag !== 'wholesale_pending');
    
    // Add new status tag
    const newTag = status === 'approved' ? 'wholesale' : 'wholesale_rejected';
    tags.push(newTag);

    // Update customer
    const updateMutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
            tags
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const updateResponse = await admin.graphql(updateMutation, {
      variables: {
        input: {
          id: customerId,
          tags: tags
        }
      }
    });

    const updateResult = await updateResponse.json();

    if (updateResult.data?.customerUpdate?.userErrors?.length > 0) {
      throw new Error(`Shopify API error: ${updateResult.data.customerUpdate.userErrors[0].message}`);
    }

    return updateResult.data.customerUpdate.customer;
  } catch (error) {
    console.error('Error updating customer status:', error);
    throw new Error('Failed to update customer status');
  }
}

export async function triggerShopifyFlow(
  request: Request,
  customerId: string,
  action: 'approved' | 'rejected'
) {
  const admin = await getAdminApi(request);

  try {
    // This is a placeholder for triggering Shopify Flow
    // You can use GraphQL mutations to trigger Flow events
    // For now, we'll log the action
    console.log(`Triggering Shopify Flow for customer ${customerId} with action: ${action}`);
    
    // Example GraphQL mutation for triggering flows (you may need to adjust based on your Flow setup)
    // const flowTrigger = `
    //   mutation {
    //     flowTriggerReceive(body: {
    //       customerId: "${customerId}",
    //       action: "${action}",
    //       timestamp: "${new Date().toISOString()}"
    //     }) {
    //       userErrors {
    //         field
    //         message
    //       }
    //     }
    //   }
    // `;

    // Uncomment and adjust if you have specific Flow triggers set up
    // const response = await admin.graphql(flowTrigger);
    // console.log('Flow trigger response:', response);
    
  } catch (error) {
    console.error('Error triggering Shopify Flow:', error);
    // Don't throw here as Flow is optional
  }
}
