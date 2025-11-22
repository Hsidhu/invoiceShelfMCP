import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export class Logger {
    private logDir: string;
    private logFile: string;
    private isEnabled: boolean;

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

    private ensureLogDirectory() {
        try {
            if (!fs.existsSync(this.logDir)) {
                fs.mkdirSync(this.logDir, { recursive: true });
            }
        } catch (error) {
            console.error('Failed to create log directory. Logging to file disabled.', error);
            this.isEnabled = false;
        }
    }

    private getDateString(): string {
        const now = new Date();
        return now.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    private getTimestamp(): string {
        return new Date().toISOString();
    }

    private writeLog(level: string, message: string, data?: any) {
        // Always log to stderr for MCP protocol visibility (if needed) or debugging
        // But typically MCP servers should keep stdout clean for JSON-RPC
        console.error(`[${level}] ${message}`, data ? JSON.stringify(data, null, 2) : '');

        if (!this.isEnabled) return;

        const logEntry = {
            timestamp: this.getTimestamp(),
            level,
            message,
            ...(data && { data })
        };

        const logLine = JSON.stringify(logEntry) + '\n';

        try {
            fs.appendFileSync(this.logFile, logLine);
        } catch (error) {
            // If writing fails, disable logging to prevent further errors
            console.error('Failed to write to log file. Disabling file logging.');
            this.isEnabled = false;
        }
    }

    info(message: string, data?: any) {
        this.writeLog('INFO', message, data);
    }

    error(message: string, data?: any) {
        this.writeLog('ERROR', message, data);
    }

    request(toolName: string, args: any) {
        this.writeLog('REQUEST', `Tool: ${toolName}`, { tool: toolName, arguments: args });
    }

    response(toolName: string, result: any, error?: any) {
        if (error) {
            this.writeLog('RESPONSE_ERROR', `Tool: ${toolName}`, { tool: toolName, error: error.message || error });
        } else {
            this.writeLog('RESPONSE_SUCCESS', `Tool: ${toolName}`, { tool: toolName, result });
        }
    }

    apiCall(method: string, endpoint: string, params?: any) {
        this.writeLog('API_CALL', `${method} ${endpoint}`, params);
    }

    apiResponse(method: string, endpoint: string, status: number, data?: any) {
        this.writeLog('API_RESPONSE', `${method} ${endpoint} - Status: ${status}`, data);
    }
}

// Singleton instance
export const logger = new Logger();