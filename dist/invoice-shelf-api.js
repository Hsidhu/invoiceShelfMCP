import axios from 'axios';
export class InvoiceShelfAPI {
    client;
    constructor(config) {
        this.client = axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.apiToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }
    handleError(error, context) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const data = error.response?.data;
            const message = data?.message || error.message;
            const details = data?.errors ? JSON.stringify(data.errors) : '';
            throw new Error(`API request failed (${context}): [${status}] ${message} ${details}`.trim());
        }
        throw new Error(`API request failed (${context}): ${error.message}`);
    }
    /**
     * Make a GET request
     */
    async get(endpoint, params) {
        try {
            const response = await this.client.get(endpoint, { params });
            return response.data;
        }
        catch (error) {
            this.handleError(error, `GET ${endpoint}`);
        }
    }
    /**
     * Make a POST request
     */
    async post(endpoint, data) {
        try {
            const response = await this.client.post(endpoint, data);
            return response.data;
        }
        catch (error) {
            this.handleError(error, `POST ${endpoint}`);
        }
    }
    /**
     * Make a PUT request
     */
    async put(endpoint, data) {
        try {
            const response = await this.client.put(endpoint, data);
            return response.data;
        }
        catch (error) {
            this.handleError(error, `PUT ${endpoint}`);
        }
    }
    /**
     * Make a DELETE request
     */
    async delete(endpoint) {
        try {
            const response = await this.client.delete(endpoint);
            return response.data;
        }
        catch (error) {
            this.handleError(error, `DELETE ${endpoint}`);
        }
    }
    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const response = await this.client.get('/me');
            return { success: true, data: response.data };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    error: `[${error.response?.status}] ${error.message}`,
                    details: error.response?.data
                };
            }
            return { success: false, error: error.message };
        }
    }
}
//# sourceMappingURL=invoice-shelf-api.js.map