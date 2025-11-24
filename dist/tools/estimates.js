import { toolRegistry } from '../tool-registry.js';
/**
 * Estimate Tools - Handle all estimate-related operations
 */
const estimateTools = [
    {
        name: 'get_estimates',
        description: 'Get a list of estimates from Invoice Shelf. Supports pagination, search, and filtering by status.',
        inputSchema: {
            type: 'object',
            properties: {
                page: {
                    type: 'number',
                    description: 'Page number for pagination (default: 1)',
                },
                limit: {
                    type: 'number',
                    description: 'Number of estimates per page (default: 15)',
                },
                search: {
                    type: 'string',
                    description: 'Search term to filter estimates',
                },
                status: {
                    type: 'string',
                    description: 'Filter by estimate status (e.g., DRAFT, SENT, VIEWED, EXPIRED, ACCEPTED, REJECTED)',
                    enum: ['DRAFT', 'SENT', 'VIEWED', 'EXPIRED', 'ACCEPTED', 'REJECTED'],
                },
                customer_id: {
                    type: 'number',
                    description: 'Filter estimates by customer ID',
                },
            },
        },
    },
    {
        name: 'get_estimate',
        description: 'Get detailed information about a specific estimate by ID',
        inputSchema: {
            type: 'object',
            properties: {
                estimateId: {
                    type: 'number',
                    description: 'The ID of the estimate to retrieve',
                },
            },
            required: ['estimateId'],
        },
    },
    {
        name: 'create_estimate',
        description: 'Create a new estimate',
        inputSchema: {
            type: 'object',
            properties: {
                customer_id: {
                    type: 'number',
                    description: 'The customer ID for this estimate',
                },
                estimate_date: {
                    type: 'string',
                    description: 'Estimate date in YYYY-MM-DD format',
                },
                expiry_date: {
                    type: 'string',
                    description: 'Expiry date in YYYY-MM-DD format',
                },
                estimate_number: {
                    type: 'string',
                    description: 'Estimate number (optional, will be auto-generated if not provided)',
                },
                reference_number: {
                    type: 'string',
                    description: 'Reference number for the estimate',
                },
                notes: {
                    type: 'string',
                    description: 'Notes for the estimate',
                },
                items: {
                    type: 'array',
                    description: 'Array of estimate items',
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
            required: ['customer_id', 'estimate_date', 'expiry_date', 'items'],
        },
    },
    {
        name: 'update_estimate',
        description: 'Update an existing estimate',
        inputSchema: {
            type: 'object',
            properties: {
                estimateId: {
                    type: 'number',
                    description: 'The ID of the estimate to update',
                },
                estimate_date: {
                    type: 'string',
                    description: 'Estimate date in YYYY-MM-DD format',
                },
                expiry_date: {
                    type: 'string',
                    description: 'Expiry date in YYYY-MM-DD format',
                },
                reference_number: {
                    type: 'string',
                    description: 'Reference number',
                },
                notes: {
                    type: 'string',
                    description: 'Notes',
                },
                status: {
                    type: 'string',
                    description: 'Estimate status',
                    enum: ['DRAFT', 'SENT', 'VIEWED', 'EXPIRED', 'ACCEPTED', 'REJECTED'],
                },
            },
            required: ['estimateId'],
        },
    },
    {
        name: 'delete_estimate',
        description: 'Delete an estimate by ID',
        inputSchema: {
            type: 'object',
            properties: {
                estimateId: {
                    type: 'number',
                    description: 'The ID of the estimate to delete',
                },
            },
            required: ['estimateId'],
        },
    },
    {
        name: 'send_estimate',
        description: 'Send an estimate to the customer via email',
        inputSchema: {
            type: 'object',
            properties: {
                estimateId: {
                    type: 'number',
                    description: 'The ID of the estimate to send',
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
            required: ['estimateId'],
        },
    },
    {
        name: 'convert_estimate_to_invoice',
        description: 'Convert an estimate into an invoice',
        inputSchema: {
            type: 'object',
            properties: {
                estimateId: {
                    type: 'number',
                    description: 'The ID of the estimate to convert',
                },
            },
            required: ['estimateId'],
        },
    },
];
async function handleEstimateTool(toolName, args, api) {
    switch (toolName) {
        case 'get_estimates': {
            const result = await api.get('/estimates', args);
            const estimates = result.data || [];
            const summary = `Found ${result.meta?.total || 0} estimates (page ${result.meta?.current_page || 1} of ${result.meta?.last_page || 1}):\n\n`;
            const estimateList = estimates.map((est) => `- Estimate #${est.estimate_number || est.id}
  Customer: ${est.customer?.name || 'N/A'}
  Amount: ${est.total || 0}
  Status: ${est.status}
  Expiry Date: ${est.expiry_date || 'N/A'}`).join('\n\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: summary + estimateList,
                    },
                ],
            };
        }
        case 'get_estimate': {
            const { estimateId } = args;
            const result = await api.get(`/estimates/${estimateId}`);
            const estimate = result.data || result;
            const items = estimate.items?.map((item) => `  - ${item.name}: ${item.quantity} x ${item.price} = ${item.total}`).join('\n') || 'No items';
            const formatted = `Estimate #${estimate.estimate_number || estimate.id}
Customer: ${estimate.customer?.name || 'N/A'}
Status: ${estimate.status}
Date: ${estimate.estimate_date}
Expiry Date: ${estimate.expiry_date}
Total: ${estimate.total}

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
        case 'create_estimate': {
            const result = await api.post('/estimates', args);
            const estimate = result.data || result;
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Estimate created successfully!\nEstimate #${estimate.estimate_number || estimate.id}\nTotal: ${estimate.total}`,
                    },
                ],
            };
        }
        case 'update_estimate': {
            const { estimateId, ...updateData } = args;
            const result = await api.put(`/estimates/${estimateId}`, updateData);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Estimate #${estimateId} updated successfully!`,
                    },
                ],
            };
        }
        case 'delete_estimate': {
            const { estimateId } = args;
            await api.delete(`/estimates/${estimateId}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Estimate #${estimateId} deleted successfully!`,
                    },
                ],
            };
        }
        case 'send_estimate': {
            const { estimateId, ...emailData } = args;
            await api.post(`/estimates/${estimateId}/send`, emailData);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Estimate #${estimateId} sent to customer via email!`,
                    },
                ],
            };
        }
        case 'convert_estimate_to_invoice': {
            const { estimateId } = args;
            const result = await api.post(`/estimates/${estimateId}/convert-to-invoice`, {});
            const invoice = result.data || result;
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Estimate #${estimateId} converted to Invoice #${invoice.invoice_number || invoice.id}!`,
                    },
                ],
            };
        }
        default:
            return null;
    }
}
// Register estimate tools
toolRegistry.register(estimateTools, handleEstimateTool);
//# sourceMappingURL=estimates.js.map