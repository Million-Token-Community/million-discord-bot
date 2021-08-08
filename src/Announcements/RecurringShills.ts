import {Client, TextChannel} from 'discord.js';
import {randomInt} from '../utils';
import {cache} from '../cache';
import {ShillMessageDataService} from '../services/ShillMessageDataService';

export class RecurringShills {
  private shillOrder: number[] = [];
  timer: NodeJS.Timeout;

  constructor(
    private client: Client,
    private channelId: string,
    private minutes: number, 
    ) {
    this.start();
  }

  async getShills(): Promise<string[]> {
    const records = await ShillMessageDataService.getAllShillMessages();
    const messages = records.map(entry => entry.message);
    await cache.set('shill_messages', messages, 4 * 60 * 60 * 1000);
    return messages;
  }

  async randomizeShillOrder(): Promise<void> {
    const shills = await this.getShills();
    const freqHash = {};
    const numShills = shills.length;

    while (numShills && this.shillOrder.length < numShills) {
      const index = randomInt(numShills - 1);

      if (freqHash[index]) continue;

      freqHash[index] = true;
      this.shillOrder.push(index);
    }
  }

  async start(): Promise<void> {
    await this.randomizeShillOrder();
    await this.action();
    this.timer = setInterval(this.action.bind(this), this.minutes * 60 * 1000);
  }

  async action(): Promise<void> {
    console.log('sending message');

    try {
      const shills = await cache.get('shill_messages');
      const channel = await this.client.channels.fetch(this.channelId) as TextChannel;
    
      if (!channel) {
        throw 'Could not find channel with ID' + this.channelId;
      }
      
      const index = this.shillOrder.pop();
      await channel.send(shills[index]);

      if (this.shillOrder.length === 0) {
        await this.randomizeShillOrder();
      }
    } catch (error) {
      console.log('Error creating announcement:', error);
    }
  }
}