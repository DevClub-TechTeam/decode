import db from '@/db/database'

export type Team = {
    id: string,
    name: string,
    createdAt: Date
};
export type CreateTeamInput = {
    name: string
};

export async function createTeam(
    input: CreateTeamInput
):Promise<string> {
    const result = await db`
        INSERT INTO teams (
                    name
        ) VALUES (
                  ${input.name}
        )
    `;
    
    const id = result.lastInsertRowid;
    if(id == null || String(id) === "0") {
        throw new Error(`Failed to create team`);
    }
    const teamId = String(id);
    return teamId;
}