// import * as Snoowrap from 'snoowrap';
import axios from 'axios';

export class RedditService {
  // r: Snoowrap;
  // constructor() {
  //   this.r = new Snoowrap({
  //     userAgent: 'mm-bot/0001',
  //     clientId: process.env.REDDIT_CLIENT_ID,
  //     clientSecret: process.env.REDDIT_SECRET,
  //     username: process.env.REDDIT_USERNAME,
  //     password: process.env.REDDIT_PASSWORD
  //   });
  // }

  static async getMMSubCount(): Promise<number> {
    const {data} = await axios.get('https://www.reddit.com/r/milliontoken/about.json');

    return data.data.subscribers
  }
}
