interface InvoiceShelfConfig {
    apiToken: string;
    baseUrl?: string;
}
export declare class InvoiceShelfAPI {
    private client;
    constructor(config: InvoiceShelfConfig);
    private handleError;
    /**
     * Make a GET request
     */
    get(endpoint: string, params?: any): Promise<any>;
    /**
     * Make a POST request
     */
    post(endpoint: string, data?: any): Promise<any>;
    /**
     * Make a PUT request
     */
    put(endpoint: string, data?: any): Promise<any>;
    /**
     * Make a DELETE request
     */
    delete(endpoint: string): Promise<any>;
    /**
     * Test API connection
     */
    testConnection(): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
        details?: undefined;
    } | {
        success: boolean;
        error: string;
        details: any;
        data?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
        details?: undefined;
    }>;
}
export {};
//# sourceMappingURL=invoice-shelf-api.d.ts.map