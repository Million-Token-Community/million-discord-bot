import * as express from 'express';
import *  as xmlparser from 'express-xml-bodyparser';
import {client} from '../discordClient';
import {youtube} from './routes/youtube'
import {rootRouter} from './routes/root';
import {millionStatsRouter} from './routes/millionStats';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';

export class ExpressApp {
  public app: express.Express;
  private PORT: string | number = process.env.PORT || 3000;

  constructor() {
    this.app = express();
    this.init();
  }

  async init(): Promise<void> {
    this.setupGlobals();
    this.setupMiddlewares();
    this.setupRoutes();

    await this.app.listen(this.PORT);
    console.log('App is listening on port:', this.PORT);
  }

  setupGlobals(): void {
    // Set discord client instance as global
    this.app.set('discordClient', client);
  }

  setupMiddlewares(): void {
    // max 100 request per minute
    const limiter = rateLimit({
      windowMs: 60 * 1e3,
      max: 100
    })

    this.app.use(
      helmet({contentSecurityPolicy: {useDefaults: false}}),
      express.json(),
      limiter,
      express.urlencoded({ extended: true }),
      xmlparser(),
    );
  }

  setupRoutes(): void {
    this.app.use('/', rootRouter);
    this.app.use('/youtube', youtube);
    this.app.use('/million-stats', millionStatsRouter);
  }
}