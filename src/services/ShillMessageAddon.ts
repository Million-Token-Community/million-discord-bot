import nodeFetch, {RequestInit} from 'node-fetch';
import {hasJsonContentType} from '../utils';

export class ShillMessageAddon {
  static defaultFetchOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  static cmcUrl = 'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/vote?id=10866';
  static coinGeckoUrl = `https://api.coingecko.com/api/v3/coins/million`;

  static hasAddon(name: string): boolean {
    return typeof ShillMessageAddon[name] === 'function';
  }
  
  static async ['CoinMarketCap'](): Promise<string>  {
    const resp = await nodeFetch(this.cmcUrl, this.defaultFetchOptions);
    const hasJson = hasJsonContentType(resp);

    if (!resp.ok) {
      const errMessage = await resp.text();
      throw new Error('Request was unsuccessful:\n' + errMessage);
    }

    if (!hasJson) {
      throw new Error('Response is not JSON');
    }

    const json = await resp.json();
    const votes = json?.data?.cryptoVoted;
    const goodPercent = votes?.goodPercent;
    const badPercent = votes?.badPercent;

    const isValidResp = typeof goodPercent === 'number'
      && typeof badPercent === 'number';

    if (!isValidResp) {
      throw new Error('Invalid CointMarketCap response');
    }

    const good =  (goodPercent * 100).toFixed(2);
    const bad = (badPercent * 100).toFixed(2);
    const message = `Current sentiment: 👍 **${good}%**    👎 **${bad}%**`;

    return message;
  }

  static async ['CoinGecko'](): Promise<string>  {
    const resp = await nodeFetch(this.coinGeckoUrl, this.defaultFetchOptions);
    const hasJson = hasJsonContentType(resp);

    if (!resp.ok) {
      const errMessage = await resp.text();
      throw new Error('Request was unsuccessful:\n' + errMessage);
    }

    if (!hasJson) {
      throw new Error('Response is not JSON');
    }

    const json = await resp.json();
    const good = json?.sentiment_votes_up_percentage;
    const bad = json?.sentiment_votes_down_percentage;

    const isValidResp = typeof good === 'number'
      && typeof bad === 'number';

    if (!isValidResp) {
      throw new Error('Invalid CointMarketCap response');
    }

    const message = `Current sentiment: 👍 **${good}%**    👎 **${bad}%**`;

    return message;
  }
}



