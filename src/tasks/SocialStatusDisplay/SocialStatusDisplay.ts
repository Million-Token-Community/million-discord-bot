import {client as discordClient} from '../../discordClient';
import {VoiceChannel} from 'discord.js';
import SettingsDataService from '../../services/SettingsDataService';
import {TwitterService} from '../../services/TwitterService';
import {channelIds} from '../../channel-IDs';
import {RedditService} from '../../services/RedditService';
import {EmailSubsService} from '../../services/EmailSubs';
import {MillionStatsService} from '../../services/MillionStatsService';
import {TelegramService} from '../../services/TelegramService';

export class SocialStatusDisplay {
  timer: NodeJS.Timer;
  statFormat = '';

  constructor() {

    this.getData();
    this.timer = setInterval(this.getData.bind(this), 5 * 60 * 1e3); // update every 5 minutes
  }

  async getData(): Promise<void> {
    try {
      this.statFormat = await SettingsDataService.getMillionStatsFormat();

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

  async setChannelName(id: string, statName: string, value: string | number): Promise<void> {
    const channel = await discordClient.channels.fetch(id) as VoiceChannel;
    const formattedName = this.statFormat
      .replace('{n}', statName)
      .replace('{c}', value.toString());
    
    await channel.setName(formattedName);
  }

  async getTwitterCount(): Promise<void> {
    try {
      const followers = await TwitterService.getFollowerCount();

      await this.setChannelName(
        channelIds.twitterStats,
        'Twitter',
        followers
      );
    } catch (error) {
      console.log('Twitter followers error: ',error);   
    }
  }

  async getRedditCount(): Promise<void> {
    try {
      const subs = await RedditService.getMMSubCount();
      await this.setChannelName(channelIds.redditStats, `Reddit`, subs);
    } catch (error) {
      console.log('Reddit subs error: ', error);
    }
  }

  async getEmailSubCount(): Promise<void> {
    try {
      const count = await EmailSubsService.getSubsCount();
      await this.setChannelName(channelIds.emailSubsChannel, `EmailSubs`, count);
    } catch (error) {
      console.log('Email subs error:', error);
    }
  }

  async getHoldersCount(): Promise<void> {
    try {
      // when the status is scheduled to update, it will also refresh the cache
      // so that when the holders command is used, there will always be a cached
      // value since the status is updated every 5 minutes and the holders cache
      // TTL is set for 11 minutes 
      const resp = await MillionStatsService.getHolders(true);

      if (resp.error) throw resp.error;

      const holdersCount = resp.data.totalHodlers.replace(',', '');
      await this.setChannelName(
        channelIds.holdersChannel, 
        `Holders`,
        holdersCount
      );
    } catch (error) {
      console.trace('Holders count error: \n', error);
    }
  }

  async getPrice(): Promise<void> {
    try {
      const resp = await MillionStatsService.getPriceData();

      if (resp.hasError) throw resp.error;

      const {price} = resp.data;
      await this.setChannelName(channelIds.price, `MM Price`, price);
    } catch (error) {
      console.log('Error updating price channel: \n', error);
    }
  }

  async getTelegramCount(): Promise<void> {
    try {
      const resp = await TelegramService.getMemberCount();
      const membersCount = resp.data;

      if (resp.hasError) throw resp.error;

      await this.setChannelName(
        channelIds.telegramCount,
        `Telegram`,
        membersCount
      );
    } catch (error) {
      console.log('Error updating Telegram Count:\n', error);
    }
  }
}