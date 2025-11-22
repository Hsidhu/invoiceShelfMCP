/**
 * Tool Registry - Manages all MCP tools
 */
class ToolRegistry {
    handlers = new Map();
    toolDefinitions = [];
    /**
     * Register a set of tools with their handler
     */
    register(tools, handler) {
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
    async handleTool(toolName, args, api) {
        const handler = this.handlers.get(toolName);
        if (handler) {
            return await handler(toolName, args, api);
        }
        return null;
    }
    /**
     * Check if a tool exists
     */
    hasTool(toolName) {
        return this.handlers.has(toolName);
    }
}
// Export singleton instance
export const toolRegistry = new ToolRegistry();
//# sourceMappingURL=tool-registry.js.map