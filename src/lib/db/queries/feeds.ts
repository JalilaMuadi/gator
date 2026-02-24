// src\lib\db\queries\feeds.ts
import { db } from "../index"; 
import { feeds, users } from "../schema";
import { eq } from "drizzle-orm";

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

type CreateFeedArgs = {
  name: string;
  url: string;
  userId: string;
};

export async function createFeed(userId: string, name: string, url: string) {
  const [feed] = await db
    .insert(feeds)
    .values({
      name,
      url,
      user_id: userId,
    })
    .returning();
  return feed;
}

// src/lib/db/queries/feeds.ts
export async function getAllFeeds() {
  const allFeeds = await db
    .select({
      feedName: feeds.name,
      feedUrl: feeds.url,
      createdAt: feeds.created_at,
      updatedAt: feeds.updated_at,
      userName: users.name,
    })
    .from(feeds)
    .leftJoin(users, eq(feeds.user_id, users.id));

  return allFeeds;
}

// helper to print feed
export function printFeed(feed: typeof feeds.$inferSelect, user: any) {
  console.log("Feed added:");
  console.log(`ID: ${feed.id}`);
  console.log(`Name: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
  console.log(`Created at: ${feed.created_at}`);
  console.log(`Updated at: ${feed.updated_at}`);
}
