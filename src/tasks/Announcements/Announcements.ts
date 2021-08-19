import {Client} from 'discord.js';
import {RecurringShills} from './RecurringShills';
import {channelIds} from '../../channel-IDs';
import { YouTubeNotification } from '../promote/you-tube/notifications';

export class Announcements {  
  constructor(private client: Client) {
    this.createAnnouncements();
  }

  // shills
  createAnnouncements(): void {
    new RecurringShills(
      this.client, 
      channelIds.lounge,  
      5
    );
    new YouTubeNotification(
      this.client,
      channelIds.promoteOnYouTube
    );
  }
}