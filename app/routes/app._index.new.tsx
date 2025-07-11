import type { LoaderFunctionArgs } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Badge,
  Icon,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { 
  PlusIcon,
  PersonIcon,
  CheckIcon,
  SettingsIcon 
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <Page>
      <TitleBar title="Wholesale Management Hub">
        <button 
          variant="primary" 
          onClick={() => navigate("/app/wholesale/dashboard")}
        >
          Manage Applications
        </button>
      </TitleBar>
      
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingLg">
                      Welcome to Wholesale Management
                    </Text>
                    <Badge tone="info">Active</Badge>
                  </InlineStack>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    Streamline your wholesale business with automated application 
                    processing, customer management, and pricing controls.
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="h3" variant="headingMd">
                      Quick Actions
                    </Text>
                    <Icon source={PlusIcon} tone="base" />
                  </InlineStack>
                  <BlockStack gap="200">
                    <Button 
                      fullWidth 
                      onClick={() => navigate("/app/wholesale/dashboard")}
                      icon={PersonIcon}
                    >
                      Review Applications
                    </Button>
                    <Button 
                      fullWidth 
                      variant="plain"
                      onClick={() => navigate("/app/additional")}
                      icon={SettingsIcon}
                    >
                      App Settings
                    </Button>
                  </BlockStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="h3" variant="headingMd">
                      System Status
                    </Text>
                    <Icon source={CheckIcon} tone="success" />
                  </InlineStack>
                  <List>
                    <List.Item>
                      <InlineStack align="space-between">
                        <Text as="span">Email Notifications</Text>
                        <Badge tone="success">Active</Badge>
                      </InlineStack>
                    </List.Item>
                    <List.Item>
                      <InlineStack align="space-between">
                        <Text as="span">Database Connection</Text>
                        <Badge tone="success">Connected</Badge>
                      </InlineStack>
                    </List.Item>
                    <List.Item>
                      <InlineStack align="space-between">
                        <Text as="span">Shopify Integration</Text>
                        <Badge tone="success">Synced</Badge>
                      </InlineStack>
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  Getting Started
                </Text>
                
                <BlockStack gap="300">
                  <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                    <BlockStack gap="200">
                      <Text as="h4" variant="headingSm">
                        🏪 Wholesale Application Process
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        Customers can apply for wholesale access through your storefront. 
                        Applications are automatically processed and you'll receive email 
                        notifications for review.
                      </Text>
                      <InlineStack gap="200">
                        <Link url="/pages/wholesale-register" target="_blank">
                          View Application Form
                        </Link>
                        <Link url="/app/wholesale/dashboard">
                          Manage Applications
                        </Link>
                      </InlineStack>
                    </BlockStack>
                  </Box>

                  <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                    <BlockStack gap="200">
                      <Text as="h4" variant="headingSm">
                        📧 Email Automation
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        Automated email notifications keep you and your customers informed 
                        throughout the wholesale application process.
                      </Text>
                      <List>
                        <List.Item>Merchant notifications for new applications</List.Item>
                        <List.Item>Customer approval/rejection emails</List.Item>
                        <List.Item>One-click approval from email links</List.Item>
                      </List>
                    </BlockStack>
                  </Box>

                  <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                    <BlockStack gap="200">
                      <Text as="h4" variant="headingSm">
                        👥 Customer Management
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        Approved wholesale customers are automatically tagged in Shopify 
                        for easy segmentation and pricing rule application.
                      </Text>
                      <InlineStack gap="200">
                        <Button 
                          variant="plain" 
                          url="shopify:admin/customers" 
                          target="_blank"
                        >
                          View Customers
                        </Button>
                        <Button 
                          variant="plain"
                          onClick={() => navigate("/app/wholesale/dashboard")}
                        >
                          Manage Wholesale
                        </Button>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
