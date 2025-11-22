import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
export class Logger {
    logDir;
    logFile;
    isEnabled;
    constructor() {
        this.isEnabled = process.env.MCP_LOGGING_ENABLED === 'true';
        // Resolve logs directory relative to the project root (assuming this file is in dist/utils/logger.js)
        // We go up two levels from utils: dist/utils -> dist -> project-root
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const projectRoot = path.resolve(__dirname, '..', '..');
        this.logDir = path.join(projectRoot, 'logs');
        this.logFile = path.join(this.logDir, `mcp-${this.getDateString()}.log`);
        if (this.isEnabled) {
            this.ensureLogDirectory();
        }
    }
    ensureLogDirectory() {
        try {
            if (!fs.existsSync(this.logDir)) {
                fs.mkdirSync(this.logDir, { recursive: true });
            }
        }
        catch (error) {
            console.error('Failed to create log directory. Logging to file disabled.', error);
            this.isEnabled = false;
        }
    }
    getDateString() {
        const now = new Date();
        return now.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    getTimestamp() {
        return new Date().toISOString();
    }
    writeLog(level, message, data) {
        // Always log to stderr for MCP protocol visibility (if needed) or debugging
        // But typically MCP servers should keep stdout clean for JSON-RPC
        console.error(`[${level}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
        if (!this.isEnabled)
            return;
        const logEntry = {
            timestamp: this.getTimestamp(),
            level,
            message,
            ...(data && { data })
        };
        const logLine = JSON.stringify(logEntry) + '\n';
        try {
            fs.appendFileSync(this.logFile, logLine);
        }
        catch (error) {
            // If writing fails, disable logging to prevent further errors
            console.error('Failed to write to log file. Disabling file logging.');
            this.isEnabled = false;
        }
    }
    info(message, data) {
        this.writeLog('INFO', message, data);
    }
    error(message, data) {
        this.writeLog('ERROR', message, data);
    }
    request(toolName, args) {
        this.writeLog('REQUEST', `Tool: ${toolName}`, { tool: toolName, arguments: args });
    }
    response(toolName, result, error) {
        if (error) {
            this.writeLog('RESPONSE_ERROR', `Tool: ${toolName}`, { tool: toolName, error: error.message || error });
        }
        else {
            this.writeLog('RESPONSE_SUCCESS', `Tool: ${toolName}`, { tool: toolName, result });
        }
    }
    apiCall(method, endpoint, params) {
        this.writeLog('API_CALL', `${method} ${endpoint}`, params);
    }
    apiResponse(method, endpoint, status, data) {
        this.writeLog('API_RESPONSE', `${method} ${endpoint} - Status: ${status}`, data);
    }
}
// Singleton instance
export const logger = new Logger();
//# sourceMappingURL=logger.js.map