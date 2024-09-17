import { createServer } from 'http';
import EventEmitter from 'node:events';
import { Database } from 'sqlite3';
import { 
    SkeletonHandler, 
    NotFoundHandler, 
    JsHandler, 
    CssHandler, 
    ManifestHandler,
    FontOtfHandler,
    FontWoffHandler,
    JpegHandler,
} from './handlers/file';
import {SubjectListHandler, SubjectItemHandler } from './handlers/subjects';
import { ServerEventHandler } from './handlers/server-events';
import type { IncomingMessage, ServerResponse } from 'http';

type Handler = (request: IncomingMessage, response: ServerResponse) => void;

const PORT = 4040;
const db = new Database('./database.db');

interface Client {
    id: string,
    response: ServerResponse
}

let clients: Client[] = [];

const eventEmitter = new EventEmitter();



const router: [RegExp, Handler][] = [
    [/^\/$/,                                      SkeletonHandler],
    [/\.ico$/,                                    NotFoundHandler],
    [/^\/tindur\/manifest.json$/,                 ManifestHandler],
    [/^\/tindur\/.*\.js(\?.*)*$/,                 JsHandler],
    [/^\/tindur\/.*\.css(\?.*)*$/,                CssHandler],
    [/^\/tindur\/fonts\/.*\.otf(\?.*)*$/,         FontOtfHandler],
    [/^\/tindur\/fonts\/.*\.woff(\?.*)*$/,        FontWoffHandler],
    [/^\/tindur\/images\/.*\.jpg(\?.*)*$/,        JpegHandler],

    [/^\/tindur\/api\/subjects(\?.*)?$/,          SubjectListHandler(db, eventEmitter)],
    [/^\/tindur\/api\/subjects\/[0-9]+$/,         SubjectItemHandler(db, eventEmitter)],

    [/^\/tindur\/api\/register$/,                 ServerEventHandler(eventEmitter)],
]

const server = createServer(async (request, response) => {
    console.log(`${new Date().toISOString()} - ${request.url}`)
    for (const element of router) {
        if (request.url?.match(element.at(0) as RegExp)) {
            (element.at(1) as Handler)(request, response);
            return;
        }
    }
    SkeletonHandler(request, response);

});
server.listen(PORT, undefined, () => {
    console.log(`Server is running on port ${PORT}`);
    process.send && process.send('ready');
});

process.on('SIGINT', function() {
    db.close(error => {
        console.log(`${new Date().toISOString()} Database down`);
        process.exit(error ? 1 : 0)
    });
    server.closeAllConnections();
});
