
import { Client } from 'discord.js';
import { YouTube } from './YouTube/NewVideoNotifier';
import { db } from './YouTube/MongoDB';
import { channelIds } from '../../channel-IDs';

export class Promotions {
  constructor(private client: Client) {
    this.run();
  }
  run(): void {
    new YouTube(
      db,
      this.client,
      channelIds.promoteYouTube
    )
  }
}
