// src\lib\db\queries\ feedsHelper.ts
import { Feed } from "./feeds";
import { users } from "../schema";

export type User = typeof users.$inferSelect;

export function printFeed(feed: Feed, user: User) {
  console.log("Feed:");
  console.log(`ID: ${feed.id}`);
  console.log(`Name: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
  console.log(`Created At: ${feed.created_at}`);
  console.log(`Updated At: ${feed.updated_at}`);
}
