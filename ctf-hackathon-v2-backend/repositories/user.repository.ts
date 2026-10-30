import db from '@/db/database'

export type User = {
    id: string,
    username: string,
    email: string,
    displayName: string,
    accountStatus: string,
    accountType: string,
    createdAt: Date
};
export type CreateUserInput = {
    username: string,
    email: string,
    displayName: string,
    passwordHash: string,
    accountType: string
}
export type UserWithPassword = User & {
    passwordHash: string
}

export async function createUser(
    input: CreateUserInput
):Promise<string> {
    let userId: string | undefined;
    
    await db.begin(async (tx) => {
        const accountType = input.accountType === "player" ? 1 : 2;
        
        const result = await tx`
            INSERT INTO users (
                        username,
                        email,
                        display_name,
                        password_hash,
                        account_type
            ) VALUES (${input.username},
                      ${input.email},
                      ${input.displayName},
                      ${input.passwordHash},
                      ${accountType}
        )`;

        const id = result.lastInsertRowid;

        if(id == null || String(id) === "0") {
            throw new Error(`Failed to create user`);
        }

        userId = String(id);

        if (input.accountType === "player") {
            await tx`
                INSERT INTO players (user_id)
                VALUES (${userId})
            `;
        } else {
            await tx`
                INSERT INTO admins (user_id)
                VALUES (${userId})
            `;
        }
    })

    if (!userId) {
        throw new Error("User creation failed");
    }

    return userId;
}