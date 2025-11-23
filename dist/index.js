#!/usr/bin/env node
import * as dotenv from 'dotenv';
// Load environment variables
dotenv.config();
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { InvoiceShelfAPI } from './invoice-shelf-api.js';
import { toolRegistry } from './tool-registry.js';
import './tools/users.js';
import './tools/invoices.js';
import './tools/customers.js';
import './tools/dashboard.js';
import { logger } from './utils/logger.js';
logger.info('Starting Invoice Shelf MCP Server');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// Initialize Invoice Shelf API
let apiToken = process.env.INVOICE_SHELF_API_TOKEN;
if (!apiToken) {
    logger.error('INVOICE_SHELF_API_TOKEN environment variable is required');
    process.exit(1);
}
logger.info('Invoice Shelf API initialized', {
    baseUrl: process.env.INVOICE_SHELF_BASE_URL,
    token: process.env.INVOICE_SHELF_API_TOKEN
});
const invoiceShelf = new InvoiceShelfAPI({
    apiToken,
    baseUrl: process.env.INVOICE_SHELF_BASE_URL
});
// Create MCP server
const server = new Server({
    name: 'invoice-shelf-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('Received tools/list request');
    const tools = [
        ...toolRegistry.getAllTools(),
        {
            name: 'test_connection',
            description: 'Test the connection to Invoice Shelf API and verify authentication',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
    ];
    logger.info('Returning tools list', { count: tools.length });
    return { tools };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    logger.request(name, args);
    try {
        const result = await toolRegistry.handleTool(name, args, invoiceShelf);
        logger.info('request result', { result: result });
        if (result) {
            return result;
        }
        // Handle other tools
        switch (name) {
            case 'test_connection': {
                const result = await invoiceShelf.testConnection();
                logger.response(name, result);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        logger.response(name, null, error);
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});
// Start the server
async function main() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        logger.info('MCP server connected and running on stdio');
    }
    catch (error) {
        logger.error('Failed to start server', { error: error.message, stack: error.stack });
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map