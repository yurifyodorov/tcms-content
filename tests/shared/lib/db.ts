import { PrismaClient } from "@prisma/client";

let dbClient: PrismaClient | null = null;

export const getDbClient = (databaseUrl?: string): PrismaClient => {
    if (!dbClient) {
        if (!databaseUrl) {
            throw new Error("databaseUrl is not provided");
        }

        dbClient = new PrismaClient({
            datasources: {
                db: {
                    url: databaseUrl,
                },
            },
        });
    }

    return dbClient;
};