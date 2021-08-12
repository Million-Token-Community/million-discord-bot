import * as Snoowrap from 'snoowrap';

export class RedditService {
  r: Snoowrap;
  constructor() {
    this.r = new Snoowrap({
      userAgent: 'mm-bot/0001',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD
    });
  }

  async getMMSubCount(): Promise<number> {
    console.log('Fetching reddit subs...');
    return await this.r.getSubreddit('milliontoken').subscribers;
  }
}