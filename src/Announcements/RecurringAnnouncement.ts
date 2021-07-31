import {Client, TextChannel} from 'discord.js';

export class RecurringAnnouncement {
  timer: NodeJS.Timeout;

  constructor(
    protected client: Client,
    protected channelId: string,
    protected interval: number, 
    protected message: string,
  ) {
    this.timer = setInterval(this.action.bind(this), this.interval);
  }

  async action(): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(this.channelId) as TextChannel;
    
      if (!channel) {
        throw 'Could not find channel with ID' + this.channelId;
      }

      await channel.send(this.message);
    } catch (error) {
      console.log('Error creating announcement:', error);
      clearInterval(this.timer);
    }
  }
}