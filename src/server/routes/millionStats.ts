import {Router} from 'express';
import {MillionStatsService} from '../../services/MillionStatsService';

export const millionStatsRouter = Router();

millionStatsRouter.get('/', async (_, res, next) => {
  try {
    const holderData = await MillionStatsService.getHolders();
    const priceData = await MillionStatsService.getPriceData();

    res.status(200).json({
      holders: holderData.data, 
      priceData: {
        price: priceData.data.price,
        percentChange: priceData.data.priceChange
      }
    });
  } catch (error) {
    next(error);
  }
});