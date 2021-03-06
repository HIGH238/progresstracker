import WebSocket from "isomorphic-ws";
import Collection from '@discordjs/collection';
import { v4 as uuidv4 } from 'uuid';
import { MessagePayload } from './types';
import { glob } from 'glob';
import OperatorExecutor from './classes/OperatorExecutor';
import { AuthManager } from './managers/AuthManager';


export class WebsocketServer {
    public clients: Collection<string, { id: string, ws: WebSocket }> = new Collection();
    public operators: Collection<string, OperatorExecutor> = new Collection();
    public server: WebSocket.Server;
    public users: AuthManager = new AuthManager(this);

    constructor(port: number) {
        this.server = new WebSocket.Server({ port });

        this.registerOperators();
        this.start();
    }

    registerOperators() {
        const ext = (__filename.endsWith("ts") ? "ts" : "js");
        glob(`${__dirname}/operators/**/**/*.${ext}`, async (err, files) => {
            files.map(f => {
                const imported = require(f);
                if (!(imported.default instanceof OperatorExecutor)) return;

                const op: OperatorExecutor = imported.default;
                this.operators.set(op.name, op);
            });
        });
    }

    addClient(id: string, ws: WebSocket) {
        this.clients.set(id, { id, ws });

        console.log('Client Connected', id)


        ws.on('close', () => {
            this.removeClient(id);
        })

        ws.on('error', (error) => {
        })

        ws.on('message', (data) => {
            try {
                const payload: MessagePayload = JSON.parse(data as string);
                if (!this.operators.has(payload.op)) return ws.send(JSON.stringify({ code: 1007, error: 'Invalid OP' }))

                const operator = this.operators.get(payload.op)
                operator?.execute(this, { id, ws }, payload);
            } catch (e) {
                console.log('Error')
            }
        })
    }

    getClient(id: string) {
        if (!this.clients.has(id)) return;
        return this.clients.get(id);
    }

    removeClient(id: string) {
        if (!this.clients.has(id)) return;

        const client = this.clients.get(id);
        if (!client) return;

        if (!client.ws.CLOSED) client.ws.close();
        this.users.deauth(id);
        this.clients.delete(id);

        console.log('Client Disconnected', id)
    }

    start() {
        this.server.on('connection', (ws) => {
            const id = uuidv4();
            this.addClient(id, ws);
        })
        process.on('exit', () => {
            this.stop();
        })
    }

    stop() {
        for (const key in this.clients.keys()) {
            const id = this.clients.keys()[key];
            this.removeClient(id);
        }

        this.server.removeAllListeners();
        this.server.close();
    }



}