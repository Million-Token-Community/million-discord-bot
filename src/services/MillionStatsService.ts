import fetch, {//Response, 
  RequestInit} from 'node-fetch';
import { cache } from '../cache';
import {
  formatPercentageChange, 
  createCovalentUrl
} from '../utils';
import {ServiceResponse} from '../models/ServiceResponse';
import {isFinite} from 'lodash';
import {PriceDataMM} from './PriceDataMM';
import { HoldersData } from '../models/HoldersData';
import {
  ContractAddresses, 
  CovalentChainIds,
  CovalentJsonBody,
  SolscanJsonBody,
  EthplorerJsonBody
} from '../types';
import axios, { AxiosResponse } from 'axios';

export class MillionStatsService {
  static ethplorerUrl = `https://api.ethplorer.io/getTokenInfo/0x6b4c7a5e3f0b99fcd83e9c089bddd6c7fce5c611?apiKey=freekey`;
  static solanaHoldersUrl = `https://api.solscan.io/token/holders?token=${ContractAddresses.SOLANA}&offset=0&size=999999`;
  
  static uniswapHoldersUrl = createCovalentUrl(
    CovalentChainIds.ETHEREUM_MAINNET, 
    ContractAddresses.UNISWAP
  );

  static bscHoldersUrl = createCovalentUrl(
    CovalentChainIds.BINANCE_SMART_CHAIN, 
    ContractAddresses.BINANCE_SMART_CHAIN
  );

  static polygonHoldersUrl = createCovalentUrl(
    CovalentChainIds.POLYGON_MAINNET, 
    ContractAddresses.POLYGON
  );

  static defaultFetchOptions: RequestInit = {
    method: 'GET',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  };

  static async getHolders(refreshCache = false): Promise<ServiceResponse<HoldersData>> {
    try {
      const cacheKey = 'holders';

      // if refreshCache is false, get cached value if available
      if (refreshCache === false) {
        const hasCachedData = await cache.has(cacheKey);

        if (hasCachedData) {
          const holdersData = await cache.get(cacheKey) as HoldersData;
          const isValidHolders = holdersData instanceof HoldersData
          
          if (!isValidHolders) {
            throw new Error('"holders" cache value is not instance of holdersData');
          }

          return new ServiceResponse(holdersData);
        }
      }
      
      const [ 
        ethplorerJsonBody, 
        solscanJsonBody, 
        ...covalentJsonBodies
      ] = await Promise.all([
        // Ethplorer request
        axios.get(this.ethplorerUrl),

        // SolScan request
        axios.get(this.solanaHoldersUrl),

        // the rest will be from CovalentHQ
        // axios.get(this.uniswapHoldersUrl),
        axios.get(this.bscHoldersUrl),
        axios.get(this.polygonHoldersUrl)
      ]);

      const ethereumHolders = this.getHoldersFromEthplorerJson(ethplorerJsonBody.data);
      const solanaHolders = this.getHoldersFromSolscanJson(solscanJsonBody.data);

      const [
        bscHolders,
        polygonHolders
      ] = this.getHoldersFromCovalentJson(covalentJsonBodies);
        
      const holdersData = new HoldersData(
        solanaHolders,
        ethereumHolders,
        bscHolders,
        polygonHolders  
      )

      // cache holders data for 11 minutes
      await cache.set(cacheKey, holdersData, 11 * 60);

      return new ServiceResponse(holdersData);  
    } catch (error) {
      if (error.isAxiosError === true) {
        return new ServiceResponse(null, error?.response?.data);
      }

      return new ServiceResponse(null, error);
    }
  }

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
        const priceUSDC_today = parseFloat(data.pool.poolDayData[0].token1Price);//price today
        const priceUSDC_yesterday = parseFloat(data.pool.poolDayData[1].token1Price);//price yesterday
        
        if (isFinite(priceUSDC_today) && isFinite(priceUSDC_yesterday)){
          //calculating the precentage change between now and yesteday. I did not multiply by 100 
          //to get percentage since the method we have already does that.
          const change_24hour = formatPercentageChange((priceUSDC_today - priceUSDC_yesterday) / priceUSDC_yesterday);
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
      return new ServiceResponse(null, error);
    }
  }

  /**
   * Returns an array of holder counts from each CovalentHQ JSON response
   * @param jsonBodies 
   * @returns 
   */
  static getHoldersFromCovalentJson(jsonBodies: AxiosResponse<CovalentJsonBody>[]): number[] {
    const holders = jsonBodies.map((body) => {
      const holdersCount =  body
        ?.data
        ?.data
        ?.pagination
        ?.total_count;

      if (!isFinite(holdersCount)) {
        throw new Error('Expected holders count from CovalentHQ API to be a number');
      }
      
      return holdersCount;
    });

    return holders;
  }

  /**
   * 
   * @param json 
   */
  static getHoldersFromSolscanJson(json: SolscanJsonBody): number {
    const owners = json.data.result;
    let count = 0;

    if (typeof owners === 'undefined') {
      throw new Error('Invalid results from Solscan');
    }

    for (const owner of owners) {
      const mmAmount = owner?.uiAmount;

      if (!isFinite(mmAmount)) {
        throw new Error('mmAmount should be a number')
      }

      if (mmAmount > 0) {
        count +=1;
      }
    }

    return count;
  }

  // get holders from ethplorer
  static getHoldersFromEthplorerJson(json: EthplorerJsonBody): number {
    const {holdersCount} = json;

    if (!isFinite(holdersCount)) {
      throw new Error('holdersCount should be a number')
    }

    return holdersCount;
  }
}
