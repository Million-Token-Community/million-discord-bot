import * as express from 'express';
import *  as xmlparser from 'express-xml-bodyparser';
import {client} from '../discordClient';
import {youtube} from './routes/youtube'
import {rootRouter} from './routes/root';


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
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(xmlparser());
  }

  setupRoutes(): void {
    this.app.use('/', rootRouter);
    this.app.use('/youtube', youtube);
  }
}