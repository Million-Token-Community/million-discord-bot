import {Client, TextChannel} from 'discord.js';
import {cache} from '../../cache';
import {ShillMessage, ShillMessageDataService} from '../../services/ShillMessageDataService';
import {random as randomInt} from 'lodash';
import {channelIds} from '../../channel-IDs';
import {ShillMessageAddon} from '../../services/ShillMessageAddon';

export class RecurringShills {
  private client: Client;
  private channelId = channelIds.lounge;
  private minutes = 15; 
  private shillOrder: number[] = [];
  private timer: NodeJS.Timeout;

  constructor() {
    // 
  }

  async start(client?: Client): Promise<void> {
    const isClientSet = this.client instanceof Client;
    const isValidClientArg = client instanceof Client;

    if (!isClientSet) {
      if (isValidClientArg) {
        this.client = client;
      } else {
        throw 'client has not been set and must be a Discord Client';
      }
    } 
    
    await this.randomizeShillOrder();
    await this.action();
    this.timer = setInterval(this.action.bind(this), this.minutes * 60 * 1000);
  }

  async getShills(): Promise<ShillMessage[]> {
    const records = await ShillMessageDataService.getAllShillMessages();
    await cache.set('shill_messages', records, 0);
    
    return records;
  }

  async randomizeShillOrder(): Promise<void> {
    const shills = await this.getShills();
    const shillCount = shills.length;
    const hasShills = shillCount > 0;
    const freqHash = {};

    while (hasShills && this.shillOrder.length < shillCount) {
      const randomIndex = randomInt(shillCount - 1);
      const hasIndex = typeof freqHash[randomIndex] === 'boolean';

      if (hasIndex) continue;

      freqHash[randomIndex] = true;
      this.shillOrder.push(randomIndex);
    }
  }

  async action(): Promise<void> {
    try {
      const channel = await this.client
        .channels
        .fetch(this.channelId) as TextChannel;
      const hasChannel = channel instanceof TextChannel;
    
      if (!hasChannel) {
        throw 'Could not find channel with ID: ' + this.channelId;
      }

      const shills = await cache.get('shill_messages') as ShillMessage[];
      const isValidShillArray = Array.isArray(shills);

      if (!isValidShillArray) {
        throw 'shill_messages in cache should be an array of strings';
      };

      const index = this.shillOrder.pop();
      const shillMessage = shills[index];
      const isValidShillMessage = typeof shillMessage.content === 'string';

      if (isValidShillMessage) {
        const hasAddon = ShillMessageAddon.hasAddon(shillMessage.name);

        if (hasAddon) {
          const addon = await ShillMessageAddon[shillMessage.name]();
          shillMessage.content = shillMessage.content + '\n\n' + addon;
        }
        
        await channel.send(shillMessage.content);
      } else {
        throw 'Shill message content should be a string';
      };

      if (this.shillOrder.length === 0) {
        await this.randomizeShillOrder();
      }
    } catch (error) {
      console.log('Error creating announcement:\n', error);
    }
  }

  async reset(): Promise<void> {
    clearInterval(this.timer);
    this.shillOrder = [];
    await this.start();
  }
}

export const recuringShills = new RecurringShills();