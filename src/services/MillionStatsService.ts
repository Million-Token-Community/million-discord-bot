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

      const isEthContentJSON = hasJsonContentType(ethExplorerResp);
      const isCovalentContentJSON = hasJsonContentType(covalentResp);
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
      return new ServiceResponse(null, error);
    }
  }

  static async getPriceData(): Promise<ServiceResponse<PriceDataMM>> {
    try {
      const cacheKey = 'priceData';
      const hasCachedData = await cache.has(cacheKey);
      let priceData: PriceDataMM;
      let isValidNumber: boolean;

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

      const apiUrl = `https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API_TOKEN}&ids=MM4`;
      const init: RequestInit = {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }
      
      const apiResponse = await fetch(apiUrl, init);
      const isValdJSON = hasJsonContentType(apiResponse);
    
      if (!isValdJSON) {
        throw new Error('fetch response should return JSON');
      }

      const apiResponseBody = await apiResponse.json();
      const apiPriceData = apiResponseBody?.[0];

      if (apiPriceData === undefined) {
        throw new Error('Invalid API response');
      }

      const priceChangeRaw = apiPriceData
        ?.['1d']
        ?.price_change_pct as string;

      const priceChangeFloat = parseFloat(priceChangeRaw);
      isValidNumber = isFinite(priceChangeFloat);

      if (!isValidNumber) {
        throw new Error(`priceChangeFloat is not a finite number`);
      }

      const priceChange = formatPercentageChange(priceChangeFloat);

      const priceRaw = apiPriceData?.price as string;      
      const priceFloat = parseFloat(priceRaw);
      isValidNumber = isFinite(priceFloat);

      if (!isValidNumber) {
        throw new Error('Error parsing price from api into float');
      }

      const price = priceFloat.toFixed(2);
      priceData = new PriceDataMM(price, priceChange);
      cache.set(cacheKey, priceData);

      return new ServiceResponse(priceData);
    } catch (error) {
      return new ServiceResponse(null, error);
    }
  }
}
