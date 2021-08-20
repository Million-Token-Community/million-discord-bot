export class PriceDataMM {
  public price: string;
  public priceChange: string;
  static readonly priceRegex = /\d{1,3}(?:[,]\d{3})*(?:[.]\d{1,4})?/;
  static readonly priceChangeRegex = /^(?:[+-])\d{1,3}(?:[,]\d{3})*(?:[.]\d{2})?/;

  constructor(price: string, priceChange: string) {
    const isValidPrice = PriceDataMM.priceRegex.test(price);
    
    if (!isValidPrice) {
      throw new Error('Invalid price format');
    }

    const isValidPriceChange = PriceDataMM.priceChangeRegex.test(priceChange);

    if (!isValidPriceChange) {
      throw new Error(`Invalid priceChange format`);
    }
    
    this.price = price;
    this.priceChange = priceChange;
  }
}