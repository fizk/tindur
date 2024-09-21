import { Database } from 'sqlite3';
import url from 'url';
import { writeResponse, writeUnauthorizedResponse } from '../helpers/response';
import { processHttpBody } from '../helpers/processHttpBody';
import authorization from '../helpers/authorization.js';
import {getAllSubjects, createSubject, updateSubject } from '../service/subjectService.js'
import type EventEmitter from 'node:events';
import type {IncomingMessage, ServerResponse} from 'http';
import type { Subject } from '../../client/index.d';

export const SubjectListHandler = (db: Database, event: EventEmitter) => async (request: IncomingMessage, response: ServerResponse) => {
    try {
        await authorization(request.headers.authorization);
    } catch (error) {
        writeUnauthorizedResponse(response, {});
        return;
    }

    switch (request.method?.toLowerCase()) {
        case 'get': {
            getAllSubjects(db, url.parse(request.url || '', true).query)
                .then(items => writeResponse(response, items, 200))
                .catch((error: Error) => writeResponse(response, error, 500))
                .finally(() => {});
        }; break;
        case 'post': {
            const data: Subject = await processHttpBody<Subject>(request);
            await createSubject(db, data).then(({row, result}) => {
                writeResponse(response, result, 201);
                event.emit('create', row, request.headers['x-client-id'] || '');
            }).catch((error: Error) => {
                writeResponse(response, error, 500);
            }).finally(() => {});
        }; break;
        default: {
            writeResponse(response, null, 405);
        }
    } 
};

export const SubjectItemHandler = (db: Database, event: EventEmitter) => async (request: IncomingMessage, response: ServerResponse) => {
    try {
        await authorization(request.headers.authorization);
    } catch (error) {
        writeUnauthorizedResponse(response, {});
        return;
    }

    const id: string = request.url?.split('/').pop()!
    const subject = await processHttpBody<Subject>(request);
    const clientId = request.headers['x-client-id'] || '';
    
    switch (request.method?.toLowerCase()) {
        case 'patch': {
            await updateSubject(db, Number(id), subject)
                .then(({result, before, after}) => {
                    writeResponse(response, result, 205);
                    event.emit(
                        before.status === after.status?'update':'move', 
                        after, 
                        clientId
                    );
                })
                .catch(error => writeResponse(response, error, 500))
                .finally(() => {})
            }; break;
        default: {
            writeResponse(response, null, 405);   
        }
    }
};
