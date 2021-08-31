import {Client} from 'discord.js';
import {recuringShills} from './RecurringShills';

export class Announcements {  
  constructor(private client: Client) {
    this.createAnnouncements();
  }

  // shills
  createAnnouncements(): void {
    recuringShills.start(this.client);
  }
}