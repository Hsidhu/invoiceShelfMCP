import { InvoiceShelfAPI } from '../invoice-shelf-api.js';
import { toolRegistry } from '../tool-registry.js';

/**
 * Invoice Tools - Handle all invoice-related operations
 */

const invoiceTools = [
    {
        name: 'get_invoices',
        description: 'Get a list of invoices from Invoice Shelf. Supports pagination, search, and filtering by status.',
        inputSchema: {
            type: 'object',
            properties: {
                page: {
                    type: 'number',
                    description: 'Page number for pagination (default: 1)',
                },
                limit: {
                    type: 'number',
                    description: 'Number of invoices per page (default: 15)',
                },
                search: {
                    type: 'string',
                    description: 'Search term to filter invoices',
                },
                status: {
                    type: 'string',
                    description: 'Filter by invoice status (e.g., DRAFT, SENT, VIEWED, OVERDUE, COMPLETED)',
                    enum: ['DRAFT', 'SENT', 'VIEWED', 'OVERDUE', 'COMPLETED', 'PARTIALLY_PAID'],
                },
                customer_id: {
                    type: 'number',
                    description: 'Filter invoices by customer ID',
                },
            },
        },
    },
    {
        name: 'get_invoice',
        description: 'Get detailed information about a specific invoice by ID',
        inputSchema: {
            type: 'object',
            properties: {
                invoiceId: {
                    type: 'number',
                    description: 'The ID of the invoice to retrieve',
                },
            },
            required: ['invoiceId'],
        },
    },
    {
        name: 'create_invoice',
        description: 'Create a new invoice',
        inputSchema: {
            type: 'object',
            properties: {
                customer_id: {
                    type: 'number',
                    description: 'The customer ID for this invoice',
                },
                invoice_date: {
                    type: 'string',
                    description: 'Invoice date in YYYY-MM-DD format',
                },
                due_date: {
                    type: 'string',
                    description: 'Due date in YYYY-MM-DD format',
                },
                invoice_number: {
                    type: 'string',
                    description: 'Invoice number (optional, will be auto-generated if not provided)',
                },
                reference_number: {
                    type: 'string',
                    description: 'Reference number for the invoice',
                },
                notes: {
                    type: 'string',
                    description: 'Internal notes for the invoice',
                },
                items: {
                    type: 'array',
                    description: 'Array of invoice items',
                    items: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'Item name',
                            },
                            description: {
                                type: 'string',
                                description: 'Item description',
                            },
                            quantity: {
                                type: 'number',
                                description: 'Quantity',
                            },
                            price: {
                                type: 'number',
                                description: 'Unit price',
                            },
                        },
                        required: ['name', 'quantity', 'price'],
                    },
                },
            },
            required: ['customer_id', 'invoice_date', 'due_date', 'items'],
        },
    },
    {
        name: 'update_invoice',
        description: 'Update an existing invoice',
        inputSchema: {
            type: 'object',
            properties: {
                invoiceId: {
                    type: 'number',
                    description: 'The ID of the invoice to update',
                },
                invoice_date: {
                    type: 'string',
                    description: 'Invoice date in YYYY-MM-DD format',
                },
                due_date: {
                    type: 'string',
                    description: 'Due date in YYYY-MM-DD format',
                },
                reference_number: {
                    type: 'string',
                    description: 'Reference number',
                },
                notes: {
                    type: 'string',
                    description: 'Internal notes',
                },
                status: {
                    type: 'string',
                    description: 'Invoice status',
                    enum: ['DRAFT', 'SENT', 'VIEWED', 'OVERDUE', 'COMPLETED'],
                },
            },
            required: ['invoiceId'],
        },
    },
    {
        name: 'delete_invoice',
        description: 'Delete an invoice by ID',
        inputSchema: {
            type: 'object',
            properties: {
                invoiceId: {
                    type: 'number',
                    description: 'The ID of the invoice to delete',
                },
            },
            required: ['invoiceId'],
        },
    },
    {
        name: 'send_invoice',
        description: 'Send an invoice to the customer via email',
        inputSchema: {
            type: 'object',
            properties: {
                invoiceId: {
                    type: 'number',
                    description: 'The ID of the invoice to send',
                },
                subject: {
                    type: 'string',
                    description: 'Email subject (optional)',
                },
                body: {
                    type: 'string',
                    description: 'Email body message (optional)',
                },
            },
            required: ['invoiceId'],
        },
    },
];

async function handleInvoiceTool(
    toolName: string,
    args: any,
    api: InvoiceShelfAPI
) {
    // Helper function to format currency (cents to dollars)
    const formatCurrency = (cents: number) => {
        const dollars = cents / 100;
        return `C$ ${dollars.toFixed(2)}`;
    };

    switch (toolName) {
        case 'get_invoices': {
            const result = await api.get('/invoices', args);

            const invoices = result.data || [];
            const summary = `Found ${result.meta?.total || 0} invoices (page ${result.meta?.current_page || 1} of ${result.meta?.last_page || 1}):\n\n`;

            const invoiceList = invoices.map((inv: any) =>
                `- Invoice #${inv.invoice_number || inv.id}
  Customer: ${inv.customer?.name || 'N/A'}
  Amount: ${inv.total || 0}
  Status: ${inv.status}
  Due Date: ${inv.due_date || 'N/A'}`
            ).join('\n\n');

            return {
                content: [
                    {
                        type: 'text',
                        text: summary + invoiceList,
                    },
                ],
            };
        }

        case 'get_invoice': {
            const { invoiceId } = args as { invoiceId: number };
            const result = await api.get(`/invoices/${invoiceId}`);

            const invoice = result.data || result;
            const items = invoice.items?.map((item: any) =>
                `  - ${item.name}: ${item.quantity} x ${item.price} = ${item.total}`
            ).join('\n') || 'No items';

            const formatted = `Invoice #${invoice.invoice_number || invoice.id}
Customer: ${invoice.customer?.name || 'N/A'}
Status: ${invoice.status}
Date: ${invoice.invoice_date}
Due Date: ${invoice.due_date}
Total: ${invoice.total}

Items:
${items}`;

            return {
                content: [
                    {
                        type: 'text',
                        text: formatted,
                    },
                ],
            };
        }

        case 'create_invoice': {
            const result = await api.post('/invoices', args);
            const invoice = result.data || result;
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Invoice created successfully!\nInvoice #${invoice.invoice_number || invoice.id}\nTotal: ${invoice.total}`,
                    },
                ],
            };
        }

        case 'update_invoice': {
            const { invoiceId, ...updateData } = args;
            const result = await api.put(`/invoices/${invoiceId}`, updateData);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Invoice #${invoiceId} updated successfully!`,
                    },
                ],
            };
        }

        case 'delete_invoice': {
            const { invoiceId } = args as { invoiceId: number };
            await api.delete(`/invoices/${invoiceId}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Invoice #${invoiceId} deleted successfully!`,
                    },
                ],
            };
        }

        case 'send_invoice': {
            const { invoiceId, ...emailData } = args;
            await api.post(`/invoices/${invoiceId}/send`, emailData);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Invoice #${invoiceId} sent to customer via email!`,
                    },
                ],
            };
        }

        default:
            return null;
    }
}

// Register invoice tools
toolRegistry.register(invoiceTools, handleInvoiceTool);
