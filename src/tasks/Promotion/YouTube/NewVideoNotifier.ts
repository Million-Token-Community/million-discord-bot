import Parser from 'rss-parser';
import { Client, TextChannel } from 'discord.js';
import { DB, YouTubeChannel } from './MongoDB';

interface Feed {
  channelTitle: string
  channelLink: string
  videoTitle: string
  videoLink: string
  pubDate: string
}

export class YouTube {
  private parser: Parser
  private db: DB
  private client: Client
  private discordChannelId: string
  private channels: YouTubeChannel[]
  private watchInterval: number
  
  constructor(db: DB, client: Client, discordChannelId: string) {
    this.parser = new Parser()
    this.db = db
    this.client = client
    this.discordChannelId = discordChannelId
    this.watchInterval = 1 * 60 * 1000 // Time when new feed request should be made. Default 1min.
    this.start()
  }

  async getFeed(feedUrl: string): Promise<Feed> {
    try {
      const feed = await this.parser.parseURL(feedUrl);
      return {
        channelTitle: feed.title,
        channelLink: feed.link,
        videoTitle: feed.items[0].title,
        videoLink: feed.items[0].link,
        pubDate: feed.items[0].pubDate
      }
    } catch(e) {
      throw new Error(`Problem with getting the feed: ${e}`);
    }
  }

  async handleFeed(channelId: string): Promise<void> {
    const feedUrl = this.getFeedUrl(channelId);
    const { channelTitle, channelLink, videoTitle, videoLink, pubDate} = await this.getFeed(feedUrl);
    const channel = await this.db.find(channelId);
    if (channel.pubDate !== pubDate) {
      const query = {
        channelTitle,
        channelLink,
        feedUrl,
        pubDate
      }
      this.db.update({ channelId, query })
      const msg = `${videoTitle}\n` + `${videoLink}`;
      this.sendNotification(msg);
    }
  }

  async loopTroughTheChannels(): Promise<void> {
    await this.setChannels();

    this.channels.forEach((channel: YouTubeChannel) => {
      this.handleFeed(channel.channelId);
    });
  }

  async setChannels(): Promise<void> {
    this.channels = await this.db.getAll();
  }

  getFeedUrl(channelId: string): string {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  }

  async sendNotification(msg: string): Promise<void> {
    try {
      const discordChannel = await this.client.channels.fetch(this.discordChannelId) as TextChannel;
    
      if (!discordChannel) {
        throw new Error(`Could not find channel with ID: ${this.discordChannelId}`);
      }

      await discordChannel.send(msg);
    } catch(e) {
      console.error(`Cannot fetch channel ${this.discordChannelId}`, e);
    }
  }

  start(): void {
    this.loopTroughTheChannels();
    setInterval(() => {
      this.loopTroughTheChannels();
    }, this.watchInterval);
  }
}