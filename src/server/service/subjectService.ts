import { Database, RunResult } from 'sqlite3';

interface Subject {
    id?: number
    subject: string | null
    name:  string | null
    description:  string | null
    status: number
    date: string
}
interface SubjectGroup {
    [key: string]: Subject[]
}
interface Quey {
    type?: string
    date?: string
}

export function getAllSubjects(db: Database, queryData: Quey): Promise<SubjectGroup> {
    return new Promise((resolve, reject) => {

        const predicade = Object.entries(queryData).reduce<[string, string][]>((previous, [key, value]) => {
            return (value !== '' && value !== null && value !== undefined)
                ? [...previous, [key, value]]
                : previous;
        }, []).map(([key, value]) => {
            switch(key) {
                case 'type': {
                    return `subject = '${value}'`;
                };
                case 'date': {
                    return `date <= '${value}'`;
                };
                default: {
                    return '';
                };
            }
        });

        const sql = predicade.length === 0
            ? `select * from Cards order by date asc`
            : `select * from Cards where ${predicade.join(' AND ')} order by date asc`

        db.all(sql, [], (error: any, rows: Subject[]) => {
            if (error) {
                reject(error);
                return;
            }
            const result = (Object as any).groupBy(rows, ({status}: {status: string}) => status);
            result[0] = result[0] ?? []
            result[1] = result[1] ?? []
            result[2] = (result[2] || []).reverse();
            resolve(result);
        });
    });
}

export function createSubject(db: Database, data: Subject): Promise<{result: RunResult, row: Subject}> {
    const allowedKeys = ['subject', 'name', 'description', 'status', 'date'];
    const typeCastedData: Partial<Subject> = Object.entries(data).reduce((previous, [key, value]) => {
        switch (key) {
            case 'status': {
                return {
                    ...previous,
                    status:  Number(value)
                }
            }; 
            default : {
                return {
                    ...previous,
                    [key]: value
                };
            };
        }
    }, {});

    const keys = Object.keys(typeCastedData).filter(key => allowedKeys.includes(key));
    // @ts-ignore
    const values = keys.map((key: any) => typeCastedData[key])
        .map(item => item === '' || item === 'null' ? null : item );

    return new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO Cards (subject, name, description, status, date) VALUES (?, ?, ?, ?, ?)");
        stmt.run(values, function (error: Error)  {
            // @ts-ignore
            if (error || (this as RunResult).changes !== 1) {
                reject(error);
                return;
            }
            db.get<Subject>(`select * from Cards where id = ${this.lastID}`, (_, row) => {
                resolve({result: (this as RunResult), row: row});
            })

        });
        stmt.finalize();
    });
}

export function getSubject(db: Database, id: number): Promise<Subject> {
    return new Promise((resolve, reject) => {
        db.get<Subject>(`SELECT * from Cards where id = ?`, [id], (err: Error|null, row) => {
            if (err) {reject(err); return;};
            if (!row) {reject(null); return;};
            resolve(row); return;
        });
    });
}

export async function updateSubject(db: Database, id: number, data: Partial<Subject>): Promise<{before: Subject, after: Subject, result: RunResult}> {
    const allowedKeys = ['subject', 'name', 'description', 'status', 'date'];

    const typeCastedData: Partial<Subject> = Object.entries(data).reduce((previous, [key, value]) => {
        switch (key) {
            case 'status': {
                return {
                    ...previous,
                    status:  Number(value)
                }
            }; 
            default : {
                return {
                    ...previous,
                    [key]: value
                };
            };
        }
    }, {});
    
    const keys = Object.keys(typeCastedData).filter(key => allowedKeys.includes(key))
    const statement = keys.map(key => `${key} = ?`);
    // @ts-ignore
    const values = keys.map(key => typeCastedData[key])
        .map(item => item === '' || item === 'null' ? null : item );

    const before = await new Promise<Subject>((resolve, reject) => {
        db.get<Subject>(`select * from Cards where id = ?`, [id], function (error, row) {
            if (error) {reject(error); return;}
            if (!row) {reject(null); return;}
            resolve(row);
        })
    });

    const result: RunResult = await new Promise((resolve, reject) => {
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

    const after = await new Promise<Subject>((resolve, reject) => {
        db.get<Subject>(`select * from Cards where id = ?`, [id], function (error, row) {
            if (error) {reject(error); return;}
            if (!row) {reject(null); return;}
            resolve(row);
        })
    });

    // lastID: number;
    // changes: number;
    return {before, result, after};
}

