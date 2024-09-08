import busboy from 'busboy';
import type {IncomingMessage} from 'http';

export type Maybe<T> = T | null | undefined

export function processHttpBody<T> (request: IncomingMessage): Promise<T> {
    return new Promise((resolve, reject) => {
        const bb = busboy({ headers: request.headers });
        const object: Record<string, string> = {};
        bb.on('field', (name: string, value: string) => object[name] = value);
        bb.on('close', () => resolve(object as T));
        request.pipe(bb);
    });
}
