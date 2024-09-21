import { Subject, SubjectGroup } from '../../client/index.d';
import { getSubject, getAllSubjects, createSubject, updateSubject } from '../service/subjectService'
import { Database } from 'sqlite3';

function run(db: Database, sql: string, params: any[] = []): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        db.run(sql, params, (error: Error) => {
            if(error) reject(error);
            else resolve();
        });
    })    
}

describe('subjectService', () => {
    let db: Database;

    beforeAll(async () => {
        db = new Database('./test.db');
        await run(db, `
            CREATE TABLE IF NOT EXISTS Cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                subject TEXT, 
                name TEXT, 
                description TEXT,
                status NUMBER,
                date NUMBER)`
            );
    });

    beforeEach(async () => {
        await run(db, `delete from Cards`);
    });

    afterEach(async () => {
        await run(db, `delete from Cards`);
    });


    describe('getSubject', () => {
        test('not found > throws exception', async () => {
            await expect(getSubject(db, 1)).rejects.toEqual(null);
        });
    
        test('found by ID', async () => {
            await run(
                db, 
                `insert into Cards (id, subject, name, description, status, date) values (?,?,?,?,?,?)`,
                [1, 'ENS', 'name', null, 1, '2001-01-01']
            );
            const actual = await getSubject(db, 1);
            const expected: Subject = {
                id: 1,
                subject: 'ENS',
                name: 'name',
                description: null,
                status: 1,
                date: '2001-01-01'
            };
    
            expect(actual).toEqual(expected)
        });
    });

    describe('getAllSubjects', () => {
        test('find all', async () => {
            const query = `insert into Cards (id, subject, name, description, status, date) values (?,?,?,?,?,?)`;
    
            await Promise.all([
                run(db, query, [1, 'ENS', 'name', null, 0, '2001-01-01']),
                run(db, query, [2, 'ISL', 'name', null, 1, '2001-01-02']),
                run(db, query, [3, 'DAN', 'name', null, 2, '2001-01-03']),
                run(db, query, [4, 'ENS', 'name', null, 0, '2001-01-04']),
                run(db, query, [5, 'ISL', 'name', null, 1, '2001-01-05']),
                run(db, query, [6, 'DAN', 'name', null, 2, '2001-01-06'])
            ]);
    
            const actual = await getAllSubjects(db, {});
            const expected: SubjectGroup = {
                0: [
                    {id: 1, subject: 'ENS', name: 'name', description: null, status: 0, date: '2001-01-01'},
                    {id: 4, subject: 'ENS', name: 'name', description: null, status: 0, date: '2001-01-04'},
                ],
                1: [
                    {id: 2, subject: 'ISL', name: 'name', description: null, status: 1, date: '2001-01-02'},
                    {id: 5, subject: 'ISL', name: 'name', description: null, status: 1, date: '2001-01-05'},
                ],
                2: [
                    {id: 6, subject: 'DAN', name: 'name', description: null, status: 2, date: '2001-01-06'},
                    {id: 3, subject: 'DAN', name: 'name', description: null, status: 2, date: '2001-01-03'},
                ],
            }
            expect(actual).toEqual(expected);
        });
    
        test('find by type', async () => {
            const query = `insert into Cards (id, subject, name, description, status, date) values (?,?,?,?,?,?)`;
    
            await Promise.all([
                run(db, query, [1, 'ENS', 'name', null, 0, '2001-01-01']),
                run(db, query, [2, 'ENS', 'name', null, 1, '2001-01-02']),
                run(db, query, [3, 'DAN', 'name', null, 2, '2001-01-03']),
                run(db, query, [4, 'ENS', 'name', null, 0, '2001-01-04']),
                run(db, query, [5, 'ISL', 'name', null, 1, '2001-01-05']),
                run(db, query, [6, 'DAN', 'name', null, 2, '2001-01-06'])
            ]);
    
            const actual = await getAllSubjects(db, {type: 'ENS'});
            const expected: Partial<SubjectGroup> = {
                0: [
                    {id: 1, subject: 'ENS', name: 'name', description: null, status: 0, date: '2001-01-01'},
                    {id: 4, subject: 'ENS', name: 'name', description: null, status: 0, date: '2001-01-04'},
                ],
                1: [
                    {id: 2, subject: 'ENS', name: 'name', description: null, status: 1, date: '2001-01-02'},
                ],
                2: []
            }
            expect(actual).toEqual(expected);
        });
    
        test('find by date', async () => {
            const query = `insert into Cards (id, subject, name, description, status, date) values (?,?,?,?,?,?)`;
    
            await Promise.all([
                run(db, query, [1, 'ENS', 'name', null, 0, '2001-01-01']),
                run(db, query, [2, 'ISL', 'name', null, 1, '2001-01-02']),
                run(db, query, [3, 'DAN', 'name', null, 2, '2001-01-03']),
                run(db, query, [4, 'ENS', 'name', null, 0, '2001-01-04']),
                run(db, query, [5, 'ISL', 'name', null, 1, '2001-01-05']),
                run(db, query, [6, 'DAN', 'name', null, 2, '2001-01-06'])
            ]);
    
            const actual = await getAllSubjects(db, {date: '2001-01-04'});
            const expected: SubjectGroup = {
                0: [
                    {id: 1, subject: 'ENS', name: 'name', description: null, status: 0, date: '2001-01-01'},
                    {id: 4, subject: 'ENS', name: 'name', description: null, status: 0, date: '2001-01-04'},
                ],
                1: [
                    {id: 2, subject: 'ISL', name: 'name', description: null, status: 1, date: '2001-01-02'},
                ],
                2: [
                    {id: 3, subject: 'DAN', name: 'name', description: null, status: 2, date: '2001-01-03'},
                ],
            }
            expect(actual).toEqual(expected);
        });
    
        test('find by date and type', async () => {
            const query = `insert into Cards (id, subject, name, description, status, date) values (?,?,?,?,?,?)`;
    
            await Promise.all([
                run(db, query, [1, 'ENS', 'name', null, 0, '2001-01-01']),
                run(db, query, [2, 'ENS', 'name', null, 1, '2001-01-02']),
                run(db, query, [3, 'DAN', 'name', null, 2, '2001-01-03']),
                run(db, query, [4, 'ENS', 'name', null, 0, '2001-01-04']),
                run(db, query, [5, 'ISL', 'name', null, 1, '2001-01-05']),
                run(db, query, [6, 'DAN', 'name', null, 2, '2001-01-06'])
            ]);
    
            const actual = await getAllSubjects(db, {date: '2001-01-04', type: 'ENS'});
            const expected: SubjectGroup = {
                0: [
                    {id: 1, subject: 'ENS', name: 'name', description: null, status: 0, date: '2001-01-01'},
                    {id: 4, subject: 'ENS', name: 'name', description: null, status: 0, date: '2001-01-04'},
                ],
                1: [
                    {id: 2, subject: 'ENS', name: 'name', description: null, status: 1, date: '2001-01-02'},
                ],
                2: [
                ],
            }
            expect(actual).toEqual(expected);
        });
    
        test('find none', async () => {
    
            const actual = await getAllSubjects(db, {date: '2001-01-04', type: 'ENS'});
            const expected: SubjectGroup = {
                0: [],
                1: [],
                2: [],
            }
            expect(actual).toEqual(expected);
        });
    });

    describe('createSubject', () => {
        test('complete object', async () => {
            const subject: Subject = {
                subject: 'ENS',
                name: 'name',
                description: null,
                status: 0,
                date: '2001-01-01'
            }
            const {result, row} = await createSubject(db, subject);
            const expected: Subject = {
                ...subject,
                id: result.lastID
            }
            expect(row).toEqual(expected);
        });
    
        test('type casting', async () => {
            const subject: Subject = {
                subject: 'ENS',
                name: 'name',
                description: 'null',
                status: 0,
                date: '2001-01-01'
            }
            const {result, row} = await createSubject(db, subject);
            const expected: Subject = {
                ...subject,
                description: null,
                id: result.lastID
            }
            expect(row).toEqual(expected);
        });
    });

    describe('updateSubject', () => {
        test('complete object', async () => {
            await run(
                db, 
                `insert into Cards (id, subject, name, description, status, date) values (?,?,?,?,?,?)`,
                [1, 'ENS', 'name', null, 1, '2001-01-01']
            );
    
            const subject: Subject = {
                subject: 'ISL',
                name: 'name',
                description: null,
                status: 1,
                date: '2001-01-01'
            }
            const {before, after, result} = await updateSubject(db, 1, subject);
            const expected: Subject = {
                ...subject,
                subject: 'ENS',
                id: result.lastID
            }
            expect(expected).toEqual(before);
            expect({
                ...expected,
                subject: 'ISL',
            }).toEqual(after);
        });
    
        test('not found > throws exception', async () => {
            const subject: Subject = {
                subject: 'ISL',
                name: 'name',
                description: null,
                status: 1,
                date: '2001-01-01'
            }
    
            await expect(updateSubject(db, 1, subject)).rejects.toEqual(null);
    
        });
    
        test('partial object', async () => {
            const subject: Subject = {
                subject: 'ISL',
                name: 'name',
                description: null,
                status: 1,
                date: '2001-01-01'
            }
    
            await run(
                db, 
                `insert into Cards (id, subject, name, description, status, date) values (?,?,?,?,?,?)`,
                [1, subject.subject, subject.name, subject.description, subject.status, subject.date]
            );
    
            const input: Partial<Subject> = {
                name: 'new name'
            }
            const {before, after, result} = await updateSubject(db, 1, input);
            const expected: Subject = {
                ...subject,
                ...input,
                id: 1
            }
            expect(expected).toEqual(after);
        });
    
        test('type casting', async () => {
            const subject: Subject = {
                subject: 'ISL',
                name: 'name',
                description: null,
                status: 1,
                date: '2001-01-01'
            }
    
            await run(
                db, 
                `insert into Cards (id, subject, name, description, status, date) values (?,?,?,?,?,?)`,
                [1, subject.subject, subject.name, subject.description, subject.status, subject.date]
            );
    
            const input: Partial<Subject> = {
                name: 'new name',
                description: '',
                subject: 'null'
            }
            const {before, after, result} = await updateSubject(db, 1, input);
            const expected: Subject = {
                ...subject,
                ...input,
                description: null,
                subject: null,
                id: 1
            }
            expect(expected).toEqual(after);
        });
    });
})
