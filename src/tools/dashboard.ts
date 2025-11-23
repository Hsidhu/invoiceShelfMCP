import { InvoiceShelfAPI } from '../invoice-shelf-api.js';
import { toolRegistry } from '../tool-registry.js';
import { formatCurrency } from '../utils/currency.js';

/**
 * Dashboard Tools - Provide summary information
 */

const dashboardTools = [
    {
        name: 'get_dashboard_stats',
        description: 'Get a dashboard overview including total customers, total invoices, and recent activity.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
];

async function handleDashboardTool(
    toolName: string,
    args: any,
    api: InvoiceShelfAPI
) {


    switch (toolName) {
        case 'get_dashboard_stats': {
            const dashboard = await api.get('/dashboard');

            // Helper to safely format currency strings/numbers
            const formatMoney = (amount: any) => {
                if (typeof amount === 'string') {
                    // If it's a string like "96996781", it might be cents or raw units. 
                    // Based on previous tools, it seems to be cents.
                    // But let's check the JSON output. "total_sales":"96996781".
                    // If it's cents, that's $969,967.81.
                    // If it's raw, it's $96M.
                    // Given "total":27500 for an estimate, that looks like cents ($275.00).
                    return formatCurrency(parseInt(amount, 10));
                }
                return formatCurrency(amount || 0);
            };

            const recentInvoices = (dashboard.recent_invoices || []).map((inv: any) =>
                `- #${inv.invoice_number || inv.id}: ${inv.total ? formatMoney(inv.total) : 'C$ 0.00'} (${inv.status}) - ${inv.customer?.name || 'Unknown Customer'}`
            ).join('\n');

            const summary = `Dashboard Overview
------------------
Total Customers: ${dashboard.total_customer_count || 0}
Total Invoices: ${dashboard.total_invoice_count || 0}
Total Estimates: ${dashboard.total_estimate_count || 0}
Total Amount Due: ${formatMoney(dashboard.total_amount_due)}

Financials:
Total Sales: ${formatMoney(dashboard.total_sales)}
Total Receipts: ${formatMoney(dashboard.total_receipts)}
Total Expenses: ${formatMoney(dashboard.total_expenses)}
Net Income: ${formatMoney(dashboard.total_net_income)}

Recent Invoices:
${recentInvoices || 'No recent invoices found.'}`;

            return {
                content: [
                    {
                        type: 'text',
                        text: summary,
                    },
                ],
            };
        }

        default:
            return null;
    }
}

// Register dashboard tools
toolRegistry.register(dashboardTools, handleDashboardTool);
