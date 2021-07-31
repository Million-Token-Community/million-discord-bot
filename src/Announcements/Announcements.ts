import {Client} from 'discord.js';
import {RecurringShills} from './RecurringShills';
import {shillMessages} from './Messages/shillMessages';

export class Announcements {  
  constructor(private client: Client) {
    this.createAnnouncements();
  }

  // shills
  createAnnouncements(): void {
    new RecurringShills(
      this.client, 
      process.env.SHILL_CHANNEL_ID,  
      10 * 1000, 
      shillMessages
    );
  }
}