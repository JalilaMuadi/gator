// \src\lib\db\queries
import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name }).returning();
  return result;
}

export async function getUserByName(name: string) {
  const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.name, name));
  return user;
}


export async function deleteAllUsers() {
  await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
}

export async function getUsers() {
  return await db.select().from(users);
}

export type User = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};