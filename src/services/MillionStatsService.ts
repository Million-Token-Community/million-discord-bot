import fetch, {Response, RequestInit} from 'node-fetch';
import { cache } from '../cache';
import {formatPercentageChange, hasJsonContentType} from '../utils';
import {ServiceResponse} from './ServiceResponse';
import {isFinite} from 'lodash';
import {PriceDataMM} from './PriceDataMM';

export class MillionStatsService {
  static async getHolders(): Promise<ServiceResponse<number>> {
    try {
      const cacheKey = 'holders';
      const hasCachedData = await cache.has(cacheKey);
      let holders: number;
      let isValidHolders: boolean;

      if (hasCachedData) {
        holders = await cache.get(cacheKey) as number;
        isValidHolders = isFinite(holders);
        
        if (!isValidHolders) {
          throw new Error('"holders" cache value is not a number');
        }

        return new ServiceResponse(holders);
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

      const ethContentType = ethExplorerResp.headers.get('Content-type');
      const isEthContentJSON = hasJsonContentType(ethContentType);

      const covalentContentType = covalentResp.headers.get('Content-type');
      const isCovalentContentJSON = hasJsonContentType(covalentContentType);

      const isValidJSON = isEthContentJSON && isCovalentContentJSON;

      if (!isValidJSON) throw new Error ('API responses should return JSON');

      const [ethExplorerBody, covalentBody] = await Promise.all([
        ethExplorerResp.json(),
        covalentResp.json(),
      ]);

      const uniSwapHolders = ethExplorerBody
        ?.tokenInfo
        ?.holdersCount as number;

      const bscHolders = covalentBody
        ?.data
        ?.pagination
        ?.total_count as number;

      const isValidUniSwapHolders = isFinite(uniSwapHolders);
      const isValidBscHolders = isFinite(bscHolders);
      isValidHolders = isValidUniSwapHolders && isValidBscHolders;

      if (!isValidHolders) {
        const msg = 'API response(s) did not return a valid number for holders';
        throw new Error(msg);
      }

      holders = uniSwapHolders + bscHolders;
      await cache.set(cacheKey, holders, 30);

      return new ServiceResponse(holders);  
    } catch (error) {
      return new ServiceResponse(null, true, error);
    }
  }
  //@ts-ignore 
  static async getPriceData(): Promise<ServiceResponse<PriceDataMM>> {
    try {
      const cacheKey = 'priceData';
      const hasCachedData = await cache.has(cacheKey);
      let priceData: PriceDataMM;
      //let isValidNumber: boolean;

      if (hasCachedData) {
        priceData = await cache.get(cacheKey) as PriceDataMM;
        const isPriceDataMM = priceData instanceof PriceDataMM;
        const isValidPriceFormat = PriceDataMM
          .priceRegex
          .test(priceData.price);

        const isValidPriceChangeFormat = PriceDataMM
          .priceChangeRegex
          .test(priceData.priceChange);

        const isValidCacheData = isPriceDataMM 
          && isValidPriceFormat 
          && isValidPriceChangeFormat;

        if (!isValidCacheData) {
          throw new Error(`${cacheKey} cache value is invalid`);
        }

        return new ServiceResponse(priceData);
      }
     
      
      const apiUrl_graphQL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'
      const query = `
      {
        pool(
          id:"0x84383fb05f610222430f69727aa638f8fdbf5cc1")
        {
          
          poolDayData(orderBy:date, orderDirection:desc,first : 2){
            date
            volumeUSD
            token0Price
            token1Price
          }
        }
      }
      `
      const init_graphQL: RequestInit = {
        method: 'POST',
        body: JSON.stringify({ query }),
      };

      const resp = await fetch(apiUrl_graphQL, init_graphQL);
      const json = await resp.json();
      const data = await json.data;
      if (data === undefined) {
        throw new Error('Invalid API response');
      }

      try {
        let priceUSDC_today = parseFloat(data.pool.poolDayData[0].token1Price);//price today
        let priceUSDC_yesterday = parseFloat(data.pool.poolDayData[1].token1Price);//price yesterday
        
        if (isFinite(priceUSDC_today) && isFinite(priceUSDC_yesterday)){
          //calculating the precentage change between now and yesteday. I did not multiply by 100 
          //to get percentage since the method we have already does that.
          let change_24hour = formatPercentageChange((priceUSDC_today - priceUSDC_yesterday) / priceUSDC_yesterday);
          priceData = new PriceDataMM(priceUSDC_today.toFixed(2), change_24hour);
          cache.set(cacheKey, priceData);
          return new ServiceResponse(priceData);

        } else {
          throw new Error('Price is not Finite');
          
        }
      
      } catch (error) {
        throw new Error('Error parsing price from api into float');
      }
      

     
    
    
    } catch (error) {
      return new ServiceResponse(null, true, error);
    }

  }


}
