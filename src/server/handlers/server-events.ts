import type EventEmitter from 'node:events';
import type {IncomingMessage, ServerResponse} from 'http';

interface Client {
    id: string,
    response: ServerResponse
}

export const ServerEventHandler = (event: EventEmitter) => {
    
    let clients: Client[] = [];

    event.on('create', (data, id) => {
        clients.forEach(client => {
            if (client.id !== id) {
                client.response.write(
                    `retry: 2500` +
                    `event: create\n` +
                    `id: ${id}\n` +
                    `data: ${JSON.stringify(data)}\n\n`
                );
            }
        });
        console.log(`${new Date().toISOString()} - CREATE | EventSource ${id}`);
    });
    event.on('update', (data, id) => {
        clients.forEach(client => {
            if (client.id !== id) {
                client.response.write(
                    `retry: 2500` +
                    `event: update\n` +
                    `id: ${id}\n` +
                    `data: ${JSON.stringify(data)}\n\n`
                );
            }
        });
        console.log(`${new Date().toISOString()} - UPDATE | EventSource ${id}`);
    });
    event.on('delete', (data, id) => {
        clients.forEach(client => {
            if (client.id !== id) {
                client.response.write(
                    `retry: 2500` +
                    `event: delete\n` +
                    `id: ${id}\n` +
                    `data: ${JSON.stringify(data)}\n\n`
                );
            }
        });
        console.log(`${new Date().toISOString()} - DELETE | EventSource ${id}`);
    });
    event.on('move', (data, id) => {
        clients.forEach(client => {
            if (client.id !== id) {
                client.response.write(
                    `retry: 2500` +
                    `event: move\n` +
                    `id: ${id}\n` +
                    `data: ${JSON.stringify(data)}\n\n`
                );
            }
        });
        console.log(`${new Date().toISOString()} - MOVE | EventSource ${id}`);
    });

    return async (request: IncomingMessage, response: ServerResponse) => {

        const clientId = String(Date.now());
        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };
        response.writeHead(200, headers).write(
            `retry: 2500` +
            `id: ${clientId}\n` +
            `event: init\n` +
            `data: ${clientId}\n\n`
        );

        clients.push({
            id: clientId,
            response
        });

        console.log(`${new Date().toISOString()} - ${request.url} | EventSource started for ${clientId} | Active clients ${clients.length}`);

        request.on('close', () => {
            response.end();
            clients = clients.filter(client => client.id !== clientId);
            console.log(`${new Date().toISOString()} - ${request.url} | EventSource closed for ${clientId} | Active clients ${clients.length}`);
        });
        request.on('error', (error: Error) => {
            response.end();
            clients = clients.filter(client => client.id !== clientId);
            console.log(`${new Date().toISOString()} - ${request.url} | EventSource error for ${clientId} ${error.message} | Active clients ${clients.length}`);
        });
    }
}

