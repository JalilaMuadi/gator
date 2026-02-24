
# gator

gator is a command-line tool (CLI) to manage RSS feeds. You can add feeds, follow/unfollow them, and see posts in your terminal.

## Requirements

- Node.js >= 22
- npm
- PostgreSQL database
- Internet connection (to fetch RSS feeds)

## Setup

1. Clone the project:
```bash
git clone https://github.com/your-username/gator.git
cd gator
````

2. Install dependencies:

```bash
npm install
```

3. Create a config file `config.json` in the root:

```json
{
  "currentUserName": ""
}
```

4. Make sure your PostgreSQL database is running and correctly set up.

---

## Available Commands

| Command              | Description                                  |
| -------------------- | -------------------------------------------- |
| register <username>  | Create a new user                            |
| login <username>     | Log in as an existing user                   |
| addfeed <name> <url> | Add a new feed (requires login)              |
| follow <feedUrl>     | Follow a feed (requires login)               |
| unfollow <feedUrl>   | Unfollow a feed (requires login)             |
| feeds / listfeeds    | List all feeds                               |
| following            | List feeds you are following                 |
| agg <time>           | Continuously fetch posts (time = 1s, 1m, 1h) |
| reset                | Delete all users (for testing)               |

---

## Example Usage

```bash
# Register a user
npm run start register Alice

# Login as the user
npm run start login Alice

# Add a feed
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"

# Follow the feed
npm run start follow "https://news.ycombinator.com/rss"

# Unfollow a feed
npm run start unfollow "https://news.ycombinator.com/rss"

# List your followed feeds
npm run start following

# List all feeds
npm run start feeds

# Start the aggregator every 1 minute
npm run start agg 1m
```

---

## Notes

* Stop the aggregation loop anytime with Ctrl+C.
* Don't fetch feeds too fast — respect the servers.
* Commands that change data (like addfeed, follow, unfollow) require you to be logged in.
* Use the `reset` command only for testing as it deletes all users.

---


