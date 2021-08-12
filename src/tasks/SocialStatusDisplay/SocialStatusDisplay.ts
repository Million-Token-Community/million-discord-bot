import {client as discordClient} from '../../discordClient';
import {VoiceChannel} from 'discord.js';
import {TwitterService} from '../../services/TwitterService';
import {channelIds} from '../../channel-IDs';
import {RedditService} from '../../services/RedditService';

export class SocialStatusDisplay {
  timer: NodeJS.Timer;
  twitterName = 'Twitter ';
  rService: RedditService; 

  constructor() {

    this.getData();
    this.timer = setInterval(this.getData.bind(this), 60 * 1e3); // update every minute
  }

  async getData(): Promise<void> {
    try {
      this.rService = await new RedditService();
      this.getTwitterCount();
      this.getRedditCount();
    } catch (error) {
      console.log('Error fetching social status data: ', error);
    } 
  }

  async setChannelName(id: string, name: string): Promise<void> {
    const channel = await discordClient.channels.fetch(id) as VoiceChannel;
    await channel.setName(name);
  }

  async getTwitterCount(): Promise<void> {
    try {
      const followers = await TwitterService.getFollowerCount();

      await this.setChannelName(
        channelIds.twitterStats,
        this.twitterName + followers
      );
    } catch (error) {
      console.log('Twitter followers error: ',error);   
    }
  }

  async getRedditCount(): Promise<void> {
    try {
      const subs = await this.rService.getMMSubCount();
      await this.setChannelName(channelIds.redditStats, `Reddit ${subs}`);
    } catch (error) {
      console.log('Reddit subs error: ', error);
       
    }
  }
}