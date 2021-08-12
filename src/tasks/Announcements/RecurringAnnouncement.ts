import {Client, TextChannel} from 'discord.js';

export class RecurringAnnouncement {
  timer: NodeJS.Timeout;

  constructor(
    protected client: Client,
    protected channelId: string,
    protected minutes: number, 
    protected message: string,
  ) {
    this.action();
    this.timer = setInterval(this.action.bind(this), this.minutes * 60 * 1000);
  }

  async action(): Promise<void> {
    console.log('sending message');
    
    try {
      const channel = await this.client.channels.fetch(this.channelId) as TextChannel;
    
      if (!channel) {
        throw 'Could not find channel with ID' + this.channelId;
      }

      await channel.send(this.message);
    } catch (error) {
      console.log('Error creating announcement:', error);
      
    }
  }
}