import {
  handlerRegister,
  handlerLogin,
  handlerReset,
  handlerListUsers,
  handlerListFeeds,
  handlerAgg,
  handlerAddFeed,
  handlerFollow,
  handlerFollowing,
  CommandsRegistry,
  registerCommand,
  runCommand,
  handlerUnfollow,
  middlewareLoggedIn
} from "./commands";

async function main() {
  const registry: CommandsRegistry = {};

  // Commands without middleware
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", handlerListUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "listfeeds", handlerListFeeds);
  registerCommand(registry, "feeds", handlerListFeeds);

  // Commands that require logged-in user
  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));

  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Not enough arguments provided");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}

main();