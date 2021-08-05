import {RecurringAnnouncement} from './RecurringAnnouncement';
import {Client, TextChannel} from 'discord.js';
import {randomInt} from '../utils';

export class RecurringShills extends RecurringAnnouncement {
  private shillOrder: number[] = [];

  constructor(
    client: Client,
    channelId: string,
    minutes: number, 
    private shills: string[],) {
    super(client, channelId, minutes, '');
    this.randomizeShillOrder();
  }

  async action(): Promise<void> {
    console.log('sending message');

    try {
      const channel = await this.client.channels.fetch(this.channelId) as TextChannel;
    
      if (!channel) {
        throw 'Could not find channel with ID' + this.channelId;
      }
      
      const index = this.shillOrder.pop();
      await channel.send(this.shills[index]);

      if (this.shillOrder.length === 0) {
        this.randomizeShillOrder();
      }
    } catch (error) {
      console.log('Error creating announcement:', error);
    }
  }

  randomizeShillOrder(): void {
    const freqHash = {};
    const numShills = this.shills.length;

    while (numShills && this.shillOrder.length < numShills) {
      const index = randomInt(numShills - 1);

      if (freqHash[index]) continue;

      freqHash[index] = true;
      this.shillOrder.push(index);
    }
  }
}