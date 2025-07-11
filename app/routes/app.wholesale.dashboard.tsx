import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Banner,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  EmptyState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  // For now, return mock data until database integration is complete
  const requests = [
    {
      id: 1,
      companyName: "Sample Company Inc.",
      contactName: "John Doe",
      email: "john@samplecompany.com",
      phone: "+1-555-0123",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      companyName: "Test Business LLC",
      contactName: "Jane Smith",
      email: "jane@testbusiness.com",
      phone: "+1-555-0456",
      status: "approved",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
  
  return json({ requests });
};

export default function WholesaleDashboard() {
  const { requests } = useLoaderData<typeof loader>();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge tone="attention">Pending</Badge>;
      case "approved":
        return <Badge tone="success">Approved</Badge>;
      case "rejected":
        return <Badge tone="critical">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const rows = requests.map((request: any) => [
    request.companyName,
    request.contactName,
    request.email,
    request.phone || "N/A",
    getStatusBadge(request.status),
    new Date(request.createdAt).toLocaleDateString(),
    request.status === "pending" ? "Actions available" : "No actions needed",
  ]);

  const headings = [
    "Company",
    "Contact",
    "Email",
    "Phone",
    "Status",
    "Applied",
    "Actions",
  ];

  return (
    <Page>
      <TitleBar title="Wholesale Applications" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Banner
              title="Wholesale Application Management"
              tone="info"
            >
              <Text as="p">
                Review and manage wholesale customer applications. Approved customers
                will be automatically tagged in Shopify for pricing rule application.
              </Text>
            </Banner>

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Applications ({requests.length})
                  </Text>
                  <InlineStack gap="200">
                    <Badge tone="attention">
                      {`${requests.filter((r: any) => r.status === "pending").length} Pending`}
                    </Badge>
                    <Badge tone="success">
                      {`${requests.filter((r: any) => r.status === "approved").length} Approved`}
                    </Badge>
                  </InlineStack>
                </InlineStack>

                {requests.length > 0 ? (
                  <DataTable
                    columnContentTypes={[
                      'text',
                      'text',
                      'text',
                      'text',
                      'text',
                      'text',
                      'text',
                    ]}
                    headings={headings}
                    rows={rows}
                  />
                ) : (
                  <EmptyState
                    heading="No wholesale applications yet"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <Text as="p">
                      When customers apply for wholesale access through your
                      storefront, their applications will appear here for review.
                    </Text>
                  </EmptyState>
                )}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
