import { Glob } from 'bun';
import { resolve } from "node:path";
import db from '@/db/database';

const migrationsDir = resolve(import.meta.dir, "../../db/migrations");

async function migrate() {
    await db`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            name VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    `;

    const appliedMigrations = await db<{ name: string }[]>`
        SELECT name FROM schema_migrations
    `;

    const applied = new Set(
        appliedMigrations.map(migration => migration.name)
    );
    
    const glob = new Glob("*.sql");
    const files = Array.from(
        glob.scanSync({
            cwd: migrationsDir,
            absolute: true
        })
    ).sort();
    
    for(const file of files) {
        const name = file.split(/[\\/]/).pop()!;
        
        if(applied.has(name)) continue;
        
        console.log(`Applying ${name}`);

        await db.file(file).simple();

        await db`
            INSERT INTO schema_migrations (name)
            VALUES (${name})
        `;
    }
    
    console.log(`Migrations completed.`)
}

try {
    await migrate();
} catch (e) {
    console.error(`Migration failed.`, e);
    process.exitCode = 1;
} finally {
    await db.close();
}