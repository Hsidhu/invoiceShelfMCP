# Invoice Shelf MCP Server

A Model Context Protocol (MCP) server for integrating with [Invoice Shelf](https://invoiceshelf.com/). This server allows LLMs (like Claude, ChatGPT) to interact with your Invoice Shelf instance to manage customers, invoices, and payments.

Check out the official [Invoice Shelf Repository](https://github.com/InvoiceShelf/InvoiceShelf).

## Features

- **Customer Management**: List and search customers.
- **Estimate Management**:
    - List estimates with filtering (status, search, pagination).
    - Get detailed estimate information.
    - Create new estimates.
    - Update existing estimates.
    - Delete estimates.
    - Send estimates via email.
    - Convert estimates to invoices.
- **Invoice Management**:
    - List invoices with filtering (status, search, pagination).
    - Get detailed invoice information.
    - Create new invoices.
    - Update existing invoices.
    - Delete invoices.
    - Send invoices via email.

## Prerequisites

- Node.js (v18 or higher)
- An Invoice Shelf instance
- An API Token from Invoice Shelf

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd invoice-shelf-mcp
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  Build the project:
    ```bash
    npm run build
    ```

## Configuration

Create a `.env` file in the root directory (copy from `.env.example` if available):

```env
INVOICE_SHELF_BASE_URL=https://your-invoice-shelf-domain.com/api/v1
INVOICE_SHELF_API_TOKEN=your_api_token_here
```

> **Important**: The `INVOICE_SHELF_API_TOKEN` in the `.env` file is primarily used for the **test script** and local development. When using this server with an MCP Client (like Claude Desktop or AnythingLLM), you should configure the API token directly in the **MCP Client's configuration file** (see [Connecting to an MCP Client](#connecting-to-an-mcp-client)). The MCP Client's configuration will take precedence.

### Generating an API Token

You can easily generate an API token using the provided helper script.

1.  Update your `.env` file with your Invoice Shelf credentials:
    ```env
    INVOICE_SHELF_USERNAME=your_email@example.com
    INVOICE_SHELF_PASSWORD=your_password
    INVOICE_SHELF_DEVICE_NAME=mcp-server
    ```

2.  Run the script:
    ```bash
    sh test/api-curl.sh
    ```

3.  Copy the token from the response and update `INVOICE_SHELF_API_TOKEN` in your `.env` file.

> **Note**: If you are using a self-signed certificate or a local development environment with SSL issues, you might need to set `NODE_TLS_REJECT_UNAUTHORIZED=0` in your environment, but this is **not recommended for production**.

## Usage

### Running the Server

```bash
npm start
```

### Connecting to an MCP Client

Add the server configuration to your MCP client (e.g., Claude Desktop, AnythingLLM):

```json
{
  "mcpServers": {
    "invoice-shelf": {
      "command": "node",
      "args": ["/path/to/invoice-shelf-mcp/dist/index.js"],
      "env": {
        "INVOICE_SHELF_BASE_URL": "https://your-invoice-shelf-domain.com/api/v1",
        "INVOICE_SHELF_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

## Available Tools

| Tool Name | Description |
| :--- | :--- |
| `get_invoices` | List invoices with pagination and filtering. |
| `get_invoice` | Get details of a specific invoice. |
| `create_invoice` | Create a new invoice. |
| `update_invoice` | Update an existing invoice. |
| `delete_invoice` | Delete an invoice. |
| `send_invoice` | Email an invoice to the customer. |
| `get_estimates` | List estimates with pagination and filtering. |
| `get_estimate` | Get details of a specific estimate. |
| `create_estimate` | Create a new estimate. |
| `update_estimate` | Update an existing estimate. |
| `delete_estimate` | Delete an estimate. |
| `send_estimate` | Email an estimate to the customer. |
| `convert_estimate_to_invoice` | Convert an estimate into an invoice. |
| `get_customers` | List and search customers. |
| `get_dashboard_stats` | Get a dashboard overview including total customers, total invoices, and recent activity. |
| `test_connection` | Verify connectivity to the Invoice Shelf API. |

## Development

- **Build**: `npm run build`
- **Watch Mode**: `npm run dev`
- **Logs**: Check the `logs/` directory for detailed request/response logs.

## Acknowledgements

Special thanks to the [Invoice Shelf](https://github.com/InvoiceShelf/InvoiceShelf) contributors for building an amazing open-source invoicing solution.


