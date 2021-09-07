import * as dotenv from 'dotenv';
dotenv.config();
import { Client, WSEventType } from 'discord.js';
import {GatewayServer, SlashCreator } from 'slash-create';
import * as path from 'path';
import { MessageHandlerManager } from './handlers/MessageHandlerManager';
import { SuggestionsBox } from './handlers/SuggestionsBox';
import * as Express from 'express';
import {client} from './discordClient';
import *  as xmlparser from 'express-xml-bodyparser';
import { youtube } from './tasks/Promotions/YouTube/Routes';
import { YouTubeSubscription } from './tasks/Promotions/YouTube/Subscription';
import {Announcements} from './tasks/Announcements/Announcements';
import {SocialStatusDisplay} from './tasks/SocialStatusDisplay/SocialStatusDisplay';

class Main {
  private creator: SlashCreator;
  protected client: Client;
  private messageHandlerManager:MessageHandlerManager
  private PORT: string | number = process.env.PORT || 3000;

  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    const app = Express();

    // Middlewares
    app.use(Express.json())
    app.use(Express.urlencoded({ extended: true }));
    app.use(xmlparser());

    // Routes
    app.use('/youtube', youtube);

    app.get('/', (_,res) => {
      return res.send('Million-bot online!')
    })

    app.listen(this.PORT, async () => {
      console.log('App is listening on port:', this.PORT);
      
      await this.initializeBot();

      // Set discord client instance as global
      app.set('discordClient', this.client)
    });
  }

  initializeListeners() {
    this.client.on('ready', () => {
      console.log('Bot started successfully. Starting tasks...')
      this.initializeTasks();
    });
    this.creator.on('debug', (message) => console.log(message));
    this.client.on("message", (msg) => {this.messageHandlerManager.handle(msg)})
    this.client.on('error', (error) => {
      console.log(error);
    })
  }

  async initializeBot() {
    console.log('Starting...');
    this.client = client;
    this.creator = new SlashCreator({
      applicationID: process.env.APPLICATION_ID,
      publicKey: process.env.PUBLIC_KEY,
      token: process.env.TOKEN,
    });

    console.log('Initializing listeners...');
    this.initializeListeners();
    
    this.creator
      .withServer(
        new GatewayServer(
          (handler) => {
            this.client.ws.on(<WSEventType>'INTERACTION_CREATE', handler);
          },
        ),
      )
      .registerCommandsIn(path.join(__dirname, 'commands'))
      .syncCommands();

      this.messageHandlerManager = new MessageHandlerManager() 
      .add(new SuggestionsBox())

    await this.client.login(process.env.TOKEN);
  }

  initializeTasks() {
    new Announcements(this.client);
    new SocialStatusDisplay();
    new YouTubeSubscription();
  }
}

new Main();
