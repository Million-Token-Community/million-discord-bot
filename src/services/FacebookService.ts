import nodeFetch, { RequestInit } from 'node-fetch';
import * as queryString from 'qs';

export class FacebookService {
  static readonly BASE_URL = 'https://graph.facebook.com/v11.0';
  static defaultFetchOptions: RequestInit = {
    headers: {
      'Authorization': `Bearer ${process.env.Facebook_USER_ACCESS_TOKEN}`
    }
  }

  static async getGroupMemberCount(): Promise<number> {
    console.log('Fetching Facebook group member count...');
    
    const url = `${this.BASE_URL}/milliontoken`;
    const qs = queryString.stringify({
      'fields': 'member_count'
    });

    const fetchOptions: RequestInit = {
      ...this.defaultFetchOptions,
      method: 'GET'
    };

    const resp = await nodeFetch(`${url}?${qs}`, fetchOptions);
    const json: FacebookResponse = await resp.json();

    return json.member_count;
  }
}

interface FacebookResponse {
  member_count: number
}