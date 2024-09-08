import { Database, RunResult } from 'sqlite3';
import { writeResponse, writeUnauthorizedResponse } from '../helpers/response';
import { processHttpBody } from '../helpers/processHttpBody';
import authorization from '../helpers/authorization.js';
import url from 'url';
import type {IncomingMessage, ServerResponse} from 'http';

interface Subject {
    id?: string
    subject: string | null
    name:  string | null
    description:  string | null
    status: number
    date: number
}
interface SubjectGroup {
    [key: string]: Subject[]
}
interface Quey {
    type?: string
}

export const SubjectListHandler = (db: Database) => async (request: IncomingMessage, response: ServerResponse) => {
    
    switch (request.method?.toLowerCase()) {
        case 'get': {
            var queryData: Quey = url.parse(request.url || '', true).query;
            getAllSubjects(db, queryData)
                .then(items => writeResponse(response, items, 200))
                .catch((error: Error) => writeResponse(response, error, 500))
                .finally(() => {});
        }; break;
        case 'post': {
            const data = await processHttpBody<Subject>(request);
            const payload = {
                subject: data.subject === '' ? null : data.subject,
                name: data.name === '' ? null : data.name,
                description: data.description === '' ? null : data.description,
                status: Number(data.status),
                date: data.date,
            };

            await createSubject(db, payload).then(item => {
                writeResponse(response, item, 201);
            }).catch((error: Error) => {
                writeResponse(response, error, 500);
            }).finally(() => {});
        }; break;
        default: {
            writeResponse(response, null, 405);
        }
    } 
};

export const SubjectItemHandler = (db: Database) => async (request: IncomingMessage, response: ServerResponse) => {
    const id: string = request.url?.split('/').pop() as string;
    const body = await processHttpBody<Subject>(request);
    
    switch (request.method?.toLowerCase()) {
        case 'patch': {
            try {
                // await authorization(request.headers.authorization);
                await updateSubject(db, id, body).then(result => writeResponse(response, result, 205))
                    .catch(error => writeResponse(response, error, 500))
                    .finally(() => {})
                } catch (e) {
                    writeUnauthorizedResponse(response);
                }
            }; break;
        default: {
            writeResponse(response, null, 405);   
        }
    }
};

function getAllSubjects(db: Database, queryData: Quey): Promise<SubjectGroup> {
    return new Promise((resolve, reject) => {

        // FIXME
        const sql = queryData.type
            ? `select * from Cards where subject = '${queryData.type}' order by date desc`
            : `select * from Cards order by date desc`

        db.all(sql, [], (error: any, rows: Subject[]) => {
            if (error) {
                reject(error);
                return;
            }
            resolve((Object as any).groupBy(rows, ({status}: {status: string}) => status));
        });
    });
}

function createSubject(db: Database, data: Subject): Promise<RunResult> {
    const allowedKeys = ['subject', 'name', 'description', 'status', 'date'];
    const keys = Object.keys(data).filter(key => allowedKeys.includes(key));
    const values = keys.map(key => (data as any)[key]);

    return new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO Cards (subject, name, description, status, date) VALUES (?, ?, ?, ?, ?)");
        stmt.run(values, function (error: Error)  {
            // @ts-ignore
            if (error || (this as RunResult).changes !== 1) {
                reject(error);
                return;
            }
            resolve((this as RunResult));
        });
        stmt.finalize();
    });
}

function updateSubject(db: Database, id: string, data: Partial<Subject>): Promise<any> {
    const allowedKeys = ['subject', 'name', 'description', 'status', 'date'];
    const keys = Object.keys(data).filter(key => allowedKeys.includes(key))
    const statement = keys.map(key => `${key} = ?`);
    const values = keys.map(key => (data as any)[key]);
    
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`UPDATE Cards set ${statement.join(', ')} where id = ?`);
        stmt.run([...values, id], function (error: Error)  {
            // @ts-ignore
            if (error || (this as RunResult).changes !== 1) {
                reject(error);
                return;
            }
            resolve((this as RunResult));
        });
        stmt.finalize();
    });
}

