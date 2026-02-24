import { db } from "../index";
import { feedFollows, users, feeds } from "../schema";
import { and, eq } from "drizzle-orm";

export type FeedFollow = typeof feedFollows.$inferSelect;

export async function createFeedFollow(userId: string, feedId: string) {
  const [newFollow] = await db.insert(feedFollows).values({
    user_id: userId,
    feed_id: feedId,
  }).returning();

  const [fullFollow] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.created_at,
      updatedAt: feedFollows.updated_at,
      userName: users.name,
      feedName: feeds.name,
      feedUrl: feeds.url,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.user_id, users.id))
    .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id))
    .where(eq(feedFollows.id, newFollow.id));

  return fullFollow;
}

export async function getFeedFollowsForUser(userId: string) {
  const follows = await db
    .select({
      feedName: feeds.name,
      feedUrl: feeds.url,
      userName: users.name,
      createdAt: feedFollows.created_at,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id))
    .innerJoin(users, eq(feedFollows.user_id, users.id))
    .where(eq(feedFollows.user_id, userId));

  return follows;
}

export async function deleteFeedFollow(userId: string, feedUrl: string) {
  const [feed] = await db.select().from(feeds).where(eq(feeds.url, feedUrl));
  if (!feed) {
    throw new Error(`Feed with URL ${feedUrl} not found`);
  }

  await db
    .delete(feedFollows)
    .where(
      and(
        eq(feedFollows.user_id, userId),
        eq(feedFollows.feed_id, feed.id)
      )
    );

  return feed;
}