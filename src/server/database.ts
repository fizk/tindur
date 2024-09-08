import { Database } from 'sqlite3';

function run(db: Database, sql: string, args: any[]|undefined = undefined) {
    return new Promise((resolve, reject) => {
        const statement = db.prepare(sql);
        statement.run(args, function (a: Error | null, b: any) {
            if (b) {
                console.error(sql, b);
                reject(b);
                return;
            }
            if (a) {
                console.error(sql, a.message);
            } else {
                console.log(sql);
            }
            // @ts-ignore
            resolve(this);
            return;
        });
    });
}


(async function() {
    const db = new Database('./database.db');

    // WANTLIST
    
    await run(db, `
        CREATE TABLE IF NOT EXISTS Cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            subject TEXT, 
            name TEXT, 
            description TEXT,
            status NUMBER,
            date NUMBER
    )`);


    // await Promise.all(resistorFixedValues.map(value => {
    //     return run(db, `INSERT INTO ResistorFixed (id, text, value, active) VALUES (?, ?, ?, ?)`, [
    //         value.at(1), 
    //         value.at(0), 
    //         value.at(1), 
    //         0
    //     ]);
    // }));
    
  
})();


    
    
 
    