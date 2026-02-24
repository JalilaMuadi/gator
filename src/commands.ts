// src/commands.ts
import { setUser, readConfig } from "./config";
import { createUser, getUserByName, deleteAllUsers, getUsers, User } from "./lib/db/queries/users";
import { fetchFeed } from "./lib/rss";
import { createFeed, printFeed, getAllFeeds } from "./lib/db/queries/feeds";
import { createFeedFollow, getFeedFollowsForUser, deleteFeedFollow } from "./lib/db/queries/feedFollows";
import { feeds } from "./lib/db/schema";
import { db } from "./lib/db/index"; 
import { eq } from "drizzle-orm";

// ----------------------
// Types
// ----------------------
export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

// ----------------------
// Helpers
// ----------------------
export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
  registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
  const handler = registry[cmdName];
  if (!handler) throw new Error(`Unknown command: ${cmdName}`);
  await handler(cmdName, ...args);
}

// ----------------------
// Middleware
// ----------------------
// src/commands.ts
export const middlewareLoggedIn = (handler: UserCommandHandler): CommandHandler => {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig();
    if (!config.currentUserName) throw new Error("No current user set. Please login or register first.");

    const dbUser = await getUserByName(config.currentUserName);
    if (!dbUser) throw new Error(`User ${config.currentUserName} not found`);

    const user: User = {
      id: dbUser.id,
      name: dbUser.name,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };

    await handler(cmdName, user, ...args);
  };
};
// ----------------------
// Command Handlers
// ----------------------
export const handlerLogin: CommandHandler = async (cmdName, ...args) => {
  if (args.length < 1) throw new Error("login requires a username");

  const username = args[0];
  const user = await getUserByName(username);
  if (!user) throw new Error(`User ${username} does not exist`);

  setUser(username);
  console.log(`Logged in as ${username}`);
};

export const handlerRegister: CommandHandler = async (cmdName, ...args) => {
  if (args.length < 1) throw new Error("register requires a username");

  const username = args[0];
  const existingUser = await getUserByName(username);
  if (existingUser) throw new Error(`User ${username} already exists`);

  const user = await createUser(username);
  setUser(username);
  console.log(`User ${username} created!`);
  console.log(user);
};

export const handlerReset: CommandHandler = async () => {
  try {
    await deleteAllUsers();
    console.log("All users have been removed!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to reset users:", err);
    process.exit(1);
  }
};

export const handlerListUsers: CommandHandler = async () => {
  try {
    const allUsers = await getUsers();
    const config = readConfig();
    const currentUser = config.currentUserName;

    allUsers.forEach(user => {
      const mark = user.name === currentUser ? " (current)" : "";
      console.log(`* ${user.name}${mark}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Failed to list users:", err);
    process.exit(1);
  }
};

export const handlerAgg: CommandHandler = async () => {
  try {
    const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(feed, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Failed to fetch RSS feed:", err);
    process.exit(1);
  }
};

// ----------------------
// Handlers that require logged-in user
// ----------------------
export const handlerAddFeed: UserCommandHandler = async (cmdName, user, ...args) => {
  if (args.length < 2) throw new Error("addfeed requires a name and a url");

  const [feedName, feedUrl] = args;
  const feed = await createFeed(user.id, feedName, feedUrl);
  await createFeedFollow(user.id, feed.id);
  printFeed(feed, user);
};

export const handlerFollow: UserCommandHandler = async (cmdName, user, ...args) => {
  if (args.length < 1) throw new Error("follow requires a feed URL");

  const feedUrl = args[0];
  const [feed] = await db.select().from(feeds).where(eq(feeds.url, feedUrl));
  if (!feed) throw new Error(`Feed with URL ${feedUrl} not found`);

  await createFeedFollow(user.id, feed.id);
  console.log(`${user.name} is now following feed: ${feed.name}`);
};

export const handlerFollowing: UserCommandHandler = async (cmdName, user) => {
  const follows = await getFeedFollowsForUser(user.id);

  if (follows.length === 0) {
    console.log(`${user.name} is not following any feeds`);
    return;
  }

  follows.forEach(f => {
    console.log(`- ${f.feedName} (${f.feedUrl})`);
  });
};

// ----------------------
// Normal command for listing feeds
// ----------------------
export const handlerListFeeds: CommandHandler = async () => {
  try {
    const allFeeds = await getAllFeeds();
    if (allFeeds.length === 0) {
      console.log("No feeds found.");
      return;
    }

    allFeeds.forEach(feed => {
      console.log(`Feed Name: ${feed.feedName}`);
      console.log(`URL: ${feed.feedUrl}`);
      console.log(`Created by: ${feed.userName}`);
      console.log(`Created At: ${feed.createdAt}`);
      console.log(`Updated At: ${feed.updatedAt}`);
      console.log('---------------------------');
    });
  } catch (err) {
    console.error("Failed to list feeds:", err);
    process.exit(1);
  }
};

// ----------------------
// New UserCommandHandler
// ----------------------
export const handlerUnfollow: UserCommandHandler = async (cmdName, user, ...args) => {
  if (args.length < 1) throw new Error("unfollow requires a feed URL");

  const feedUrl = args[0];

  const feed = await deleteFeedFollow(user.id, feedUrl);
  console.log(`${user.name} has unfollowed feed: ${feed.name}`);
};