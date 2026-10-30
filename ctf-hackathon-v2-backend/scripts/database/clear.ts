import db from '@/db/database';

await db`
    DROP TABLE IF EXISTS team_players;
    DROP TABLE IF EXISTS admins;
    DROP TABLE IF EXISTS players;
    DROP TABLE IF EXISTS teams;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS schema_migrations;
`.simple();