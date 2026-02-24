import { XMLParser } from "fast-xml-parser";

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  // 1. Fetch the feed
  const res = await fetch(feedURL, {
    headers: { "User-Agent": "gator" },
  });
  const xml = await res.text();

  // 2. Parse the XML
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const parsed = parser.parse(xml);

  // 3. Extract the channel
  if (!parsed.rss || !parsed.rss.channel) {
    throw new Error("Invalid RSS feed: missing channel");
  }

  const channel = parsed.rss.channel;

  // 4. Extract metadata
  const title = channel.title;
  const link = channel.link;
  const description = channel.description;

  if (!title || !link || !description) {
    throw new Error("Invalid RSS feed: missing title, link or description");
  }

  // 5. Extract items
  let items: RSSItem[] = [];
  if (channel.item) {
    if (Array.isArray(channel.item)) {
      items = channel.item;
    } else if (typeof channel.item === "object") {
      items = [channel.item];
    }
    // Filter valid items
    items = items
      .filter(
        (item: any) =>
          item.title && item.link && item.description && item.pubDate
      )
      .map((item: any) => ({
        title: item.title,
        link: item.link,
        description: item.description,
        pubDate: item.pubDate,
      }));
  }

  return {
    channel: {
      title,
      link,
      description,
      item: items,
    },
  };
}
