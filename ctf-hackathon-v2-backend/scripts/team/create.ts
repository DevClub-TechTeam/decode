import db from '@/db/database';
import { createTeam } from '@/repositories/team.repository'

// usage: bun run team:create [display name]

const displayName = Bun.argv.slice(2);
if (displayName.length < 1) {
    console.error("Usage: bun run team:create [display name]")
    process.exit(1);
}
try {
    const teamId = await createTeam({
        name: displayName.join(" ").trim()
    });
    console.log(`Created new team with id ${teamId}`);
} catch (e) {
    console.error("Could not create new team:", e);
    process.exitCode = 1;
} finally {
    await db.close();
}
