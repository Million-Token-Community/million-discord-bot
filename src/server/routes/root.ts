import {Router} from "express";

class RootRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  init() {
    this.router.get('/', (_,res) => {
      return res.send('Million-bot online!')
    });
  }
}

export const rootRouter = new RootRouter().router;