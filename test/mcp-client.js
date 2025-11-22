
import { spawn } from 'child_process';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';

class TestClient {
    constructor() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const serverPath = path.resolve(__dirname, '../dist/index.js');

        this.process = spawn('node', [serverPath], {
            env: { ...process.env, PATH: process.env.PATH }
        });

        this.rl = readline.createInterface({
            input: this.process.stdout,
            terminal: false
        });

        this.handlers = new Map();
        this.setupListeners();
    }

    setupListeners() {
        this.rl.on('line', (line) => {
            try {
                if (!line.trim()) return;
                const msg = JSON.parse(line);
                this.logMessage('<- Received', msg);

                if (msg.id && this.handlers.has(msg.id)) {
                    this.handlers.get(msg.id)(msg);
                    this.handlers.delete(msg.id);
                }
            } catch (e) {
                console.error('Error parsing line:', line);
            }
        });

        this.process.stderr.on('data', (data) => {
            console.error(`[Server Log] ${data}`);
        });
    }

    logMessage(prefix, msg) {
        const logMsg = { ...msg };
        if (logMsg.result && logMsg.result.tools) {
            logMsg.result.tools = `[${logMsg.result.tools.length} tools]`;
        }
        console.log(`${prefix}:`, JSON.stringify(logMsg, null, 2));
    }

    send(msg) {
        this.logMessage('-> Sending', msg);
        this.process.stdin.write(JSON.stringify(msg) + '\n');
    }

    async request(method, params = {}, id) {
        return new Promise((resolve) => {
            this.handlers.set(id, resolve);
            this.send({ jsonrpc: '2.0', id, method, params });
        });
    }

    async run() {
        console.log('Starting initialization...');

        // 1. Initialize
        await this.request('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'test-client', version: '1.0.0' }
        }, 1);
        console.log('✅ Initialization successful');

        this.send({ jsonrpc: '2.0', method: 'notifications/initialized' });

        // 2. List Tools
        console.log('Testing tools/list...');
        const toolsRes = await this.request('tools/list', {}, 2);
        console.log('✅ Tools list received');
        console.log(`Found ${toolsRes.result.tools.length} tools`);

        // 3. Test Connection
        console.log('Testing test_connection tool...');
        const connRes = await this.request('tools/call', {
            name: 'test_connection',
            arguments: {}
        }, 3);

        console.log('✅ Connection test result received');
        console.log(JSON.stringify(connRes.result, null, 2));

        this.process.kill();
        process.exit(0);
    }
}

const client = new TestClient();
client.run().catch(console.error);
