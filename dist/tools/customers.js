import { toolRegistry } from '../tool-registry.js';
import { formatCurrency } from '../utils/currency.js';
/**
 * Customer Tools - Handle all customer-related operations
 */
const customerTools = [
    {
        name: 'get_customers',
        description: 'Get a list of customers from Invoice Shelf. Supports pagination and search.',
        inputSchema: {
            type: 'object',
            properties: {
                page: {
                    type: 'number',
                    description: 'Page number for pagination (default: 1)',
                },
                limit: {
                    type: 'number',
                    description: 'Number of customers per page (default: 15)',
                },
                search: {
                    type: 'string',
                    description: 'Search term to filter customers by name or email',
                },
            },
        },
    },
    {
        name: 'get_customer',
        description: 'Get detailed information about a specific customer by ID, including their outstanding balance and invoices',
        inputSchema: {
            type: 'object',
            properties: {
                customerId: {
                    type: 'number',
                    description: 'The ID of the customer to retrieve',
                },
            },
            required: ['customerId'],
        },
    },
    {
        name: 'get_customer_invoices',
        description: 'Get all invoices for a specific customer',
        inputSchema: {
            type: 'object',
            properties: {
                customerId: {
                    type: 'number',
                    description: 'The ID of the customer',
                },
                status: {
                    type: 'string',
                    description: 'Filter by invoice status (e.g., OVERDUE, UNPAID)',
                },
            },
            required: ['customerId'],
        },
    },
    {
        name: 'create_customer',
        description: 'Create a new customer',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Customer name',
                },
                email: {
                    type: 'string',
                    description: 'Customer email address',
                },
                phone: {
                    type: 'string',
                    description: 'Customer phone number',
                },
                company_name: {
                    type: 'string',
                    description: 'Company name',
                },
                website: {
                    type: 'string',
                    description: 'Customer website',
                },
                billing_address: {
                    type: 'object',
                    description: 'Billing address details',
                },
            },
            required: ['name'],
        },
    },
    {
        name: 'update_customer',
        description: 'Update an existing customer',
        inputSchema: {
            type: 'object',
            properties: {
                customerId: {
                    type: 'number',
                    description: 'The ID of the customer to update',
                },
                name: {
                    type: 'string',
                    description: 'Customer name',
                },
                email: {
                    type: 'string',
                    description: 'Customer email',
                },
                phone: {
                    type: 'string',
                    description: 'Phone number',
                },
            },
            required: ['customerId'],
        },
    },
    {
        name: 'delete_customer',
        description: 'Delete a customer by ID',
        inputSchema: {
            type: 'object',
            properties: {
                customerId: {
                    type: 'number',
                    description: 'The ID of the customer to delete',
                },
            },
            required: ['customerId'],
        },
    },
];
async function handleCustomerTool(toolName, args, api) {
    switch (toolName) {
        case 'get_customers': {
            const result = await api.get('/customers', args);
            const customers = result.data || [];
            const summary = `Found ${result.meta?.total || 0} customers (page ${result.meta?.current_page || 1} of ${result.meta?.last_page || 1}):\n\n`;
            const customerList = customers.map((customer) => `- ${customer.name} (ID: ${customer.id})
  Email: ${customer.email || 'N/A'}
  Phone: ${customer.phone || 'N/A'}
  Due Amount: ${customer.due_amount ? formatCurrency(customer.due_amount) : 'C$ 0.00'}`).join('\n\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: summary + customerList,
                    },
                ],
            };
        }
        case 'get_customer': {
            const { customerId } = args;
            const result = await api.get(`/customers/${customerId}`);
            const customer = result.data || result;
            const formatted = `Customer Details:
- Name: ${customer.name}
- Email: ${customer.email || 'N/A'}
- Phone: ${customer.phone || 'N/A'}
- Company: ${customer.company_name || 'N/A'}
- ID: ${customer.id}
- Outstanding Balance: ${customer.due_amount ? formatCurrency(customer.due_amount) : 'C$ 0.00'}
- Created: ${customer.created_at || 'N/A'}`;
            return {
                content: [
                    {
                        type: 'text',
                        text: formatted,
                    },
                ],
            };
        }
        case 'get_customer_invoices': {
            const { customerId, status } = args;
            const params = { customer_id: customerId };
            if (status)
                params.status = status;
            const result = await api.get('/invoices', params);
            const invoices = result.data || [];
            if (invoices.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'No invoices found for this customer.',
                        },
                    ],
                };
            }
            const invoiceList = invoices.map((inv) => `- Invoice #${inv.invoice_number || inv.id}
  Status: ${inv.status}
  Amount: ${inv.total ? formatCurrency(inv.total) : 'C$ 0.00'}
  Due: ${inv.due_amount ? formatCurrency(inv.due_amount) : 'C$ 0.00'}
  Due Date: ${inv.due_date}`).join('\n\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: `Invoices for customer #${customerId}:\n\n${invoiceList}`,
                    },
                ],
            };
        }
        case 'create_customer': {
            const result = await api.post('/customers', args);
            const customer = result.data || result;
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Customer created successfully!\nName: ${customer.name}\nID: ${customer.id}`,
                    },
                ],
            };
        }
        case 'update_customer': {
            const { customerId, ...updateData } = args;
            await api.put(`/customers/${customerId}`, updateData);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Customer #${customerId} updated successfully!`,
                    },
                ],
            };
        }
        case 'delete_customer': {
            const { customerId } = args;
            await api.delete(`/customers/${customerId}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Customer #${customerId} deleted successfully!`,
                    },
                ],
            };
        }
        default:
            return null;
    }
}
// Register customer tools
toolRegistry.register(customerTools, handleCustomerTool);
//# sourceMappingURL=customers.js.map