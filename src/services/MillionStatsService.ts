import fetch, {Response} from 'node-fetch';
import { cache } from '../cache';

export class MillionStatsService {
  static async getHolders(): Promise<number> {
    const cacheKey = 'holders';

    if (await cache.has(cacheKey)) {
      return (await cache.get(cacheKey)) as number
    }

    const ethExplorerUrl = `https://api.ethplorer.io/getAddressInfo/0x6b4c7a5e3f0b99fcd83e9c089bddd6c7fce5c611?apiKey=freekey`;
    const covalentUrl = `https://api.covalenthq.com/v1/56/tokens/0xBF05279F9Bf1CE69bBFEd670813b7e431142Afa4/token_holders/?key=${process.env.COVALENT_API_KEY}&page-size=1`;
    const init = {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };

    const [ethExplorerResp, covalentResp]: Response[] = await Promise.all([
      fetch(ethExplorerUrl, init),
      fetch(covalentUrl, init),
    ]);

    const [ethExplorerBody, covalentBody] = await Promise.all([
      ethExplorerResp.json(),
      covalentResp.json(),
    ]);

    const uniSwapHolders = ethExplorerBody.tokenInfo.holdersCount as number;
    const bscHolders = covalentBody.data.pagination.total_count as number;
    const holders = uniSwapHolders + bscHolders;

    await cache.set(cacheKey, holders, 30);

    return holders;  
  }
}