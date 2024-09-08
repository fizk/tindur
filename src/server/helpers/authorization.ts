import { readFile } from 'fs/promises';
import apacheMD5 from '../helpers/apacheMD5';

export default async function authorization (authorization: string | undefined): Promise<void> {
    return Promise.resolve();
    // if (authorization === undefined) {
    //     throw new Error('Authorization not provided');
    // }

    // const auth = Buffer.from(authorization.split(' ')[1],'base64').toString().split(':');
    // const user = auth[0];
    // const pass = auth[1];

    // const file = await readFile(`./.htpasswd`, 'utf8');
    // const pairs = file.trim().split("\n").map(line => line.split(':'));
    
    // const pair = pairs.find(([username, _]) => username === user);

    // if (pair === undefined) {
    //     throw new Error('Invalid credentials');
    // }

    // const [_, password] = pair;
    // if (apacheMD5(pass, password) !== password) {
    //     throw new Error('Invalid credentials');
    // }
}
