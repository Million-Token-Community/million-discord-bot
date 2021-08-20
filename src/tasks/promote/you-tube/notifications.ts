import * as Parser from 'rss-parser';
import { Client, TextChannel } from 'discord.js';
import { channels } from './youtubeChannels.json';

interface YouTubeChannel {
  name: string
  id: string
}

export class YouTubeNotification {
  private parser: Parser
  private client: Client
  private channelId: string
  private youtubeChannels: YouTubeChannel[]
  private publishPeriod: number
  private watchInterval: number

  constructor(client: Client, channelId: string) {
    this.parser = new Parser()
    this.client = client
    this.channelId = channelId
    this.youtubeChannels = channels;
    this.publishPeriod = 5 * 60 * 1000 // Period where video considered as new published. Default 5min.
    this.watchInterval = 1 * 60 * 1000 // Time when new feed request should be made. Default 1min.
    this.start()
  }

  async parseChannel(id: string): Promise<void> {
    try {
      const feed = await this.parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
      const dateNow = new Date().getTime();
      const datePub = new Date(feed.items[0].pubDate).getTime();
      const isRecentlyPublished = this.isRecentlyPublished(dateNow, datePub);
      if (isRecentlyPublished) {
        const msg = `${feed.items[0].title}\n` + 
                    `${feed.items[0].link}`;
        
        this.sendNotification(msg);
      }
    } catch(e) {
      console.error('Problem with getting the channel feed:', e);
    }
  }

  isRecentlyPublished(now: number, pub: number): boolean {
    const publishedMinutesAgo = (now - pub) / 60000;
    return publishedMinutesAgo < this.publishPeriod;
  }

  loopTroughTheChannels(): void {
    this.youtubeChannels.forEach((channel: YouTubeChannel) => {
      this.parseChannel(channel.id);
    });
  }

  async sendNotification(msg: string): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(this.channelId) as TextChannel;
    
      if (!channel) {
        throw 'Could not find channel with ID' + this.channelId;
      }

      await channel.send(msg);
    } catch(e) {
      console.error(`Cannot fetch channel ${this.channelId}`, e);
    }
  }

  start(): void {
    this.loopTroughTheChannels();
    setInterval(() => {
      this.loopTroughTheChannels();
    }, this.watchInterval);
  }
}
