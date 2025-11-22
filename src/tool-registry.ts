import { InvoiceShelfAPI } from './invoice-shelf-api.js';

/**
 * Tool Handler type definition
 */
export type ToolHandler = (
    toolName: string,
    args: any,
    api: InvoiceShelfAPI
) => Promise<any>;

/**
 * Tool Registry - Manages all MCP tools
 */
class ToolRegistry {
    private handlers: Map<string, ToolHandler> = new Map();
    private toolDefinitions: any[] = [];

    /**
     * Register a set of tools with their handler
     */
    register(tools: any[], handler: ToolHandler) {
        tools.forEach(tool => {
            this.handlers.set(tool.name, handler);
        });
        this.toolDefinitions.push(...tools);
    }

    /**
     * Get all tool definitions
     */
    getAllTools() {
        return this.toolDefinitions;
    }

    /**
     * Handle a tool call
     */
    async handleTool(toolName: string, args: any, api: InvoiceShelfAPI) {
        const handler = this.handlers.get(toolName);
        if (handler) {
            return await handler(toolName, args, api);
        }
        return null;
    }

    /**
     * Check if a tool exists
     */
    hasTool(toolName: string): boolean {
        return this.handlers.has(toolName);
    }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();