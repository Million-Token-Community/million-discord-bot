import {RecurringAnnouncement} from './RecurringAnnouncement';
import {Client, TextChannel} from 'discord.js';
import {randomInt} from '../utils';

export class RecurringShills extends RecurringAnnouncement {
  constructor(
    client: Client,
    channelId: string,
    minutes: number, 
    private shills: string[],) {
    super(client, channelId, minutes, '');
  }

  async action(): Promise<void> {
    console.log('sending message');

    try {
      const channel = await this.client.channels.fetch(this.channelId) as TextChannel;
    
      if (!channel) {
        throw 'Could not find channel with ID' + this.channelId;
      }

      const message = this.shills[randomInt(this.shills.length - 1)];

      await channel.send(message);
    } catch (error) {
      console.log('Error creating announcement:', error);
    }
  }
}