import {
    input,
    password as passwordPrompt,
    select,
} from "@inquirer/prompts";

import db from "@/db/database";
import { createUser } from "@/repositories/user.repository"

type AccountType = "admin" | "player";

type Field =
    | "username"
    | "email"
    | "type"
    | "displayname"
    | "password";

type Options = Partial<Record<Field, string>>;

const USAGE = `
Usage:
  bun run user:create

Options:
  -u, --username       Username
  -e, --email          Email address
  -t, --type           Account type (admin/player)
  -d, --displayname    Display name
  -p, --password       Password
  -h, --help           Show this help

Examples:
  bun run user:create

  bun run user:create -u john -e john@example.com -t player

  bun run user:create --username john --email john@example.com \\
    --type admin --displayname "John Smith"
`;

const FLAGS: Record<string, Field> = {
    "-u": "username",
    "--username": "username",

    "-e": "email",
    "--email": "email",

    "-t": "type",
    "--type": "type",

    "-d": "displayname",
    "--displayname": "displayname",

    "-p": "password",
    "--password": "password",
};

function parseArgs(args: string[]): {
    values: Options;
    help: boolean;
} {
    const values: Options = {};
    let help = false;
    
    if (args[0] === "--") {
        args = args.slice(1);
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]!;

        if (arg === "--help" || arg === "-h") {
            help = true;
            continue;
        }
        
        const equalsIndex = arg.startsWith("--")
            ? arg.indexOf("=")
            : -1;

        const flag = equalsIndex >= 0
            ? arg.slice(0, equalsIndex)
            : arg;

        const field = FLAGS[flag];

        if (!field) {
            throw new Error(`Unknown argument: ${arg}`);
        }

        let value: string;

        if (equalsIndex >= 0) {
            value = arg.slice(equalsIndex + 1);
        } else {
            const next = args[i + 1];

            if (!next || next.startsWith("-")) {
                throw new Error(`Missing value for ${flag}`);
            }

            value = next;
            i++;
        }

        if (value.length === 0) {
            throw new Error(`Empty value for ${flag}`);
        }

        if (values[field] !== undefined) {
            throw new Error(`Duplicate argument: ${flag}`);
        }

        values[field] = value;
    }

    return { values, help };
}

function validateText(
    field: "username" | "email" | "displayname",
    value: string,
): true | string {
    if (!value) {
        return "This field is required.";
    }

    switch (field) {
        case "username":
            if (value.length > 64) {
                return "Username cannot exceed 64 characters.";
            }
            break;

        case "email":
            if (value.length > 255) {
                return "Email cannot exceed 255 characters.";
            }
            break;

        case "displayname":
            if (value.length > 255) {
                return "Display name cannot exceed 255 characters.";
            }
            break;
    }

    return true;
}

async function getTextField(
    field: "username" | "email" | "displayname",
    provided: string | undefined,
    message: string,
): Promise<string> {
    if (provided !== undefined) {
        const value = provided.trim();
        const validation = validateText(field, value);

        if (validation !== true) {
            throw new Error(`Invalid --${field}: ${validation}`);
        }

        return value;
    }

    const value = await input({
        message,
        validate: (value) => validateText(field, value.trim()),
    });

    return value.trim();
}

async function getAccountType(
    provided: string | undefined,
): Promise<AccountType> {
    if (provided !== undefined) {
        const value = provided.trim().toLowerCase();

        if (value !== "admin" && value !== "player") {
            throw new Error(
                'Account type must be either "admin" or "player".',
            );
        }

        return value;
    }

    return select({
        message: "Account type",
        choices: [
            {
                name: "Player",
                value: "player",
            },
            {
                name: "Admin",
                value: "admin",
            },
        ],
    });
}

async function main() {
    try {
        const { values, help } = parseArgs(Bun.argv.slice(2));

        if (help) {
            console.log(USAGE);
            return;
        }
        
        const username = await getTextField(
            "username",
            values.username,
            "Username",
        );

        const email = await getTextField(
            "email",
            values.email,
            "Email address",
        );

        const type = await getAccountType(values.type);

        const displayName = await getTextField(
            "displayname",
            values.displayname,
            "Display name",
        );

        const plainPassword = values.password ??
            await passwordPrompt({
                message: "Password",
                mask: "*",
                validate: (value) =>
                    value.length > 0 || "Password cannot be empty.",
            });

        if (!plainPassword) {
            throw new Error("Password cannot be empty.");
        }
        
        const passwordHash = await Bun.password.hash(plainPassword);

        const createdUserId = await createUser({
            username: username,
            email: email,
            displayName: displayName,
            passwordHash: passwordHash,
            accountType: type
        });

        console.log("\nUser created successfully!");
        console.log(`ID:           ${createdUserId}`);
        console.log(`Username:     ${username}`);
        console.log(`Email:        ${email}`);
        console.log(`Display name: ${displayName}`);
        console.log(`Type:         ${type}`);

    } catch (error) {
        if (error instanceof Error && error.name === "ExitPromptError") {
            console.log("\nOperation cancelled.");
        } else {
            console.error("\nCould not create user:", error);
            process.exitCode = 1;
        }
    } finally {
        await db.close();
    }
}

await main();
