import { InvoiceShelfAPI } from './invoice-shelf-api.js';
/**
 * Tool Handler type definition
 */
export type ToolHandler = (toolName: string, args: any, api: InvoiceShelfAPI) => Promise<any>;
/**
 * Tool Registry - Manages all MCP tools
 */
declare class ToolRegistry {
    private handlers;
    private toolDefinitions;
    /**
     * Register a set of tools with their handler
     */
    register(tools: any[], handler: ToolHandler): void;
    /**
     * Get all tool definitions
     */
    getAllTools(): any[];
    /**
     * Handle a tool call
     */
    handleTool(toolName: string, args: any, api: InvoiceShelfAPI): Promise<any>;
    /**
     * Check if a tool exists
     */
    hasTool(toolName: string): boolean;
}
export declare const toolRegistry: ToolRegistry;
export {};
//# sourceMappingURL=tool-registry.d.ts.map