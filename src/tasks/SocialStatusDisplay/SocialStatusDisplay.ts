import {client as discordClient} from '../../discordClient';
import {VoiceChannel} from 'discord.js';
import {TwitterService} from '../../services/TwitterService';
import {channelIds} from '../../channel-IDs';

export class SocialStatusDisplay {
  timer: NodeJS.Timer;
  twitterName = 'Twitter ';

  constructor() {
    this.getData();
    this.timer = setInterval(this.getData.bind(this), 60 * 1e3); // update every minute
  }

  getData(): void {
    try {
      this.getTwitterCount();
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
}