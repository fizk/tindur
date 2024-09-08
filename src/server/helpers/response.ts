import type {ServerResponse} from 'http';

export type Maybe<T> = T | null | undefined

export function writeResponse(response: ServerResponse, data: any, code: number = 200, headers: Record<string, string> = {}) {
    const body = JSON.stringify(data);
    response.writeHead(code, {
        ...headers,
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'application/json',
    })
    .end(body);
}

export function writeUnauthorizedResponse(response: ServerResponse, data: any = null, code: number = 401, headers: Record<string, string> = {}) {
    const body = JSON.stringify(data);
    response.writeHead(code, {
        ...headers,
        'WWW-Authenticate': 'Basic realm="some stuff", charset="UTF-8"',
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'application/json',
    })
    .end(body);
}
