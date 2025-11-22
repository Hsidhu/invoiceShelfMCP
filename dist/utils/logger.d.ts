export declare class Logger {
    private logDir;
    private logFile;
    private isEnabled;
    constructor();
    private ensureLogDirectory;
    private getDateString;
    private getTimestamp;
    private writeLog;
    info(message: string, data?: any): void;
    error(message: string, data?: any): void;
    request(toolName: string, args: any): void;
    response(toolName: string, result: any, error?: any): void;
    apiCall(method: string, endpoint: string, params?: any): void;
    apiResponse(method: string, endpoint: string, status: number, data?: any): void;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map