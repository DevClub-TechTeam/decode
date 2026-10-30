import { SQL } from 'bun';

const DATABASE_URL = process.env.DATABASE_URL;
if(!DATABASE_URL) {
    throw new Error("Missing DATABASE_URL");
}

const databaseURL = new URL(DATABASE_URL);

const db = new SQL({
    url: databaseURL,
    max: 40,
    idleTimeout: 30,
    maxLifetime: 0,
    connectionTimeout: 30
});

export default db;