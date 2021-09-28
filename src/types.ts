export enum ContractAddresses{
  UNISWAP = '0x6b4c7a5e3f0b99fcd83e9c089bddd6c7fce5c611',
  BINANCE_SMART_CHAIN     = '0xBF05279F9Bf1CE69bBFEd670813b7e431142Afa4',
  POLYGON = '0x5647Fe4281F8F6F01E84BCE775AD4b828A7b8927',
  SOLANA = 'FiCiuX9DetEE89PgRAU1hmoptnem8b1fkpEq8PGYTYkd'
}

export enum CovalentChainIds {
  ETHEREUM_MAINNET    = 1,
  POLYGON_MAINNET     = 137,
  BINANCE_SMART_CHAIN = 56
}

export interface SolscanJsonBody {
  success: boolean;
  data: {
    result: [
      {
        uiAmount: number
      }
    ]
  }
}

export interface CovalentJsonBody {
  data: {
    pagination:
    {
      total_count: number
    }
  }
}

export interface EthplorerJsonBody {
  holdersCount: number
}