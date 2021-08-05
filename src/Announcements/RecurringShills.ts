import {RecurringAnnouncement} from './RecurringAnnouncement';
import {Client, TextChannel} from 'discord.js';
import {randomInt} from '../utils';

export class RecurringShills extends RecurringAnnouncement {
  private previousIndex: number |  null = null;

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

      const maxIndex = this.shills.length - 1;
      let index = randomInt(maxIndex);

      while (index === this.previousIndex) {
        index = randomInt(maxIndex)
      }

      const message = this.shills[index];
      this.previousIndex = index;

      await channel.send(message);
    } catch (error) {
      console.log('Error creating announcement:', error);
    }
  }
}