import nodeFetch, {RequestInit} from 'node-fetch';
import * as queryString from 'qs';

export class TwitterService {
  static readonly BASE_URL = 'https://api.twitter.com/2';
  static defaultFetchOptions: RequestInit = {
    headers: {
      'Authorization': `Bearer ${process.env.TWITTER_KEY}`
    }
  }

  static async getFollowerCount(): Promise<number> {
    const url = `${this.BASE_URL}/users/by/username/millionhq`;
    const qs = queryString.stringify({
      'user.fields': 'public_metrics'
    });

    const fetchOptions: RequestInit = {
      ...this.defaultFetchOptions,
      method: 'GET'
    }; 

    const resp = await nodeFetch(`${url}?${qs}`, fetchOptions);
    const json: TwitterResponse = await resp.json();

    return json.data.public_metrics.followers_count;
  }
}

interface TwitterResponse {
  data: {
    id: string;
    public_metrics: {
      followers_count: number
    }
  }
}