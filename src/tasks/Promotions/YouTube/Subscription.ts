import nodeFetch, { Response } from 'node-fetch';
import * as FormData from 'form-data';
import {random as randomInt } from 'lodash';
import { Channel, DataService } from './DataService';

export class YouTubeSubscription {
  constructor() {
    YouTubeSubscription.run();
  }
  static async sendPshbRequest(channelId: string, mode: string): Promise<Response | void> {
    try {
      const hostname = process.env.HOSTNAME;

      if (!hostname) {
        throw {
          title: 'PubSubHubBub Error',
          message: 'Hostname is needed to provide valid callback function'
        }
      }
      
      const pshbUrl = 'https://pubsubhubbub.appspot.com';
      const topicUrl = 'https://www.youtube.com/xml/feeds/videos.xml?channel_id=';
      const callbackUrl = `https://${hostname}/youtube/notification`;
    
      const form = new FormData();
    
      form.append('hub.callback', callbackUrl);
      form.append('hub.topic', topicUrl + channelId);
      form.append('hub.mode', mode);
    
      return await nodeFetch(pshbUrl, {
        method: 'POST',
        body: form,
      });

    } catch(e) {
      console.error(e);
    }
  }

  /**
   * Get status subscription for given channel. Status available on
   * PubSubHubBub official webpage. Access it by GET request with
   * query parameters of callbackUrl and topicUrl and parse this page
   * with RegExp. Statuses: 'verified', 'unverified' and 'unsubscribed'.
   * @param channelId 
   */
  static async getStatus(channelId: string): Promise<string | void> {
    try {

      const hostname = process.env.HOSTNAME;

      if (!hostname) {
        throw {
          title: 'PubSubHubBub Error',
          message: 'Hostname is needed to provide valid callback function'
        }
      }
      
      const pshbUrl = 'https://pubsubhubbub.appspot.com/subscription-details';
      const topicUrl = 'https://www.youtube.com/xml/feeds/videos.xml?channel_id=';
      const callbackUrl = `https://${hostname}/youtube/notification`;
      const url = `${pshbUrl}?hub.callback=${callbackUrl}&hub.topic=${topicUrl}${channelId}`;
      const response = await nodeFetch(url);

      const data = await response.text()
      const status = data.replace(/\s+/g, '').match(/(?<=<dt>State<\/dt><dd>)(.*?)(?=<\/dd>)/gi);
      if (typeof status !== 'undefined') {
        return status[0];
      }

    } catch(e) {
      console.error(e);
    }
  }

  /**
   * Get all channels. Check random channel status of the subscription.
   * If status is 'unverified' loop through all the channel and subscribe.
   */
  static async run(): Promise<void> {
    try {
      const channels = await DataService.getChannels();
      const random = randomInt(channels.length - 1);
      const { channel_id } = channels[random];
      const status = await this.getStatus(channel_id);

      if (typeof status !== 'undefined' && status === 'unverified') {
        channels.forEach(({ channel_id }: Channel) => {
          this.sendPshbRequest(channel_id, 'subscribe');
        });
        console.log(`Subscribed for ${channels.length} channels.`);
      } else {
        console.log('Subscriptions are up to date.')
      }

    } catch(e) {
      console.error(e);
    }
  }
}