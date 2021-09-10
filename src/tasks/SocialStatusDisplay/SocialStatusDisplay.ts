import {client as discordClient} from '../../discordClient';
import {VoiceChannel} from 'discord.js';
import {TwitterService} from '../../services/TwitterService';
import {channelIds} from '../../channel-IDs';
import {RedditService} from '../../services/RedditService';
import {EmailSubsService} from '../../services/EmailSubs';
import {MillionStatsService} from '../../services/MillionStatsService';
import {TelegramService} from '../../services/TelegramService';

export class SocialStatusDisplay {
  timer: NodeJS.Timer;
  twitterName = 'Twitter ';
  rService: RedditService; 

  constructor() {

    this.getData();
    this.timer = setInterval(this.getData.bind(this), 5 * 60 * 1e3); // update every 5 minutes
  }

  async getData(): Promise<void> {
    try {
      this.rService = await new RedditService();

      this.getTwitterCount();
      this.getRedditCount();
      this.getEmailSubCount();
      this.getHoldersCount();
      this.getPrice();
      this.getTelegramCount();
    } catch (error) {
      console.log('Error fetching social status data: \n', error);
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

  async getEmailSubCount(): Promise<void> {
    try {
      const count = await EmailSubsService.getSubsCount();
      await this.setChannelName(channelIds.emailSubsChannel, `EmailSubs ${count}`);
    } catch (error) {
      console.log('Email subs error:', error);
    }
  }

  async getHoldersCount(): Promise<void> {
    try {
      const resp = await MillionStatsService.getHolders();

      if (resp.error) throw resp.error;

      const holdersCount = resp.data.totalHodlers.replace(',', '');
      await this.setChannelName(
        channelIds.holdersChannel, 
        `Holders ${holdersCount}`
      );
    } catch (error) {
      console.log('Holders count error: \n', error);
    }
  }

  async getPrice(): Promise<void> {
    try {
      const resp = await MillionStatsService.getPriceData();

      if (resp.hasError) throw resp.error;

      const {price} = resp.data;
      await this.setChannelName(channelIds.price, `MM Price $${price}`);
    } catch (error) {
      console.log('Error updating price channel: \n', error);
    }
  }

  async getTelegramCount(): Promise<void> {
    try {
      const resp = await TelegramService.getMemberCount();
      const membersCount = resp.data;

      if (resp.hasError) throw resp.error;

      await this.setChannelName(channelIds.telegramCount, `Telegram ${membersCount}`);
    } catch (error) {
      console.log('Error updating Telegram Count:\n', error);
    }
  }
}