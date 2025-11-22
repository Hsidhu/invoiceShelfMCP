import { toolRegistry } from '../tool-registry.js';
/**
 * User Tools - Handle all user-related operations
 */
const userTools = [
    {
        name: 'get_users',
        description: 'Get a list of users from Invoice Shelf. Supports pagination and search.',
        inputSchema: {
            type: 'object',
            properties: {
                page: {
                    type: 'number',
                    description: 'Page number for pagination (default: 1)',
                },
                limit: {
                    type: 'number',
                    description: 'Number of users per page (default: 15)',
                },
                search: {
                    type: 'string',
                    description: 'Search term to filter users by name or email',
                },
            },
        },
    },
    {
        name: 'get_user',
        description: 'Get detailed information about a specific user by ID',
        inputSchema: {
            type: 'object',
            properties: {
                userId: {
                    type: 'number',
                    description: 'The ID of the user to retrieve',
                },
            },
            required: ['userId'],
        },
    },
];
async function handleUserTool(toolName, args, api) {
    switch (toolName) {
        case 'get_users': {
            const result = await api.get('/users', args);
            // Format the response for better LLM understanding
            const users = result.data || [];
            const summary = `Found ${result.meta?.total || 0} users (showing page ${result.meta?.current_page || 1} of ${result.meta?.last_page || 1}):\n\n`;
            const userList = users.map((user) => `- ${user.name} (ID: ${user.id})\n  Email: ${user.email}\n  Role: ${user.role || 'N/A'}`).join('\n\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: summary + userList,
                    },
                ],
            };
        }
        case 'get_user': {
            const { userId } = args;
            const result = await api.get(`/users/${userId}`);
            // Format single user response
            const user = result.user || result;
            const formatted = `User Details:
                - Name: ${user.name}
                - Email: ${user.email}
                - ID: ${user.id}
                - Role: ${user.role || 'N/A'}
                - Created: ${user.created_at || 'N/A'}`;
            return {
                content: [
                    {
                        type: 'text',
                        text: formatted,
                    },
                ],
            };
        }
        default:
            return null;
    }
}
// Register user tools
toolRegistry.register(userTools, handleUserTool);
//# sourceMappingURL=users.js.map