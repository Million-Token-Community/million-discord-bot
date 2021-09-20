import nodeFetch, { Response } from 'node-fetch';
import * as FormData from 'form-data';
import { Channel, DataService } from '../../../services/YouTubeSubService';

enum ChannelStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  UNSUBSCRIBED = 'unsubscribed',
  EXPIRED = 'expired'
}

export class YouTubeSubscription {
  static renewChannelsInterval =  24 * 60 * 60 * 1e3; // daily
  static maxSubInterval =       4 * 24 * 60 * 60 * 1e3  // 4 days

  constructor() {
    YouTubeSubscription.run();
    setInterval(
      () => {
        YouTubeSubscription.run()
      },
      YouTubeSubscription.renewChannelsInterval
    )
  }

  static async sendPshbRequest(
    channelId: string, 
    mode: 'subscribe' | 'unsubscribe'
  ): Promise<Response | void> {
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
      console.error('PSHB request error:\n', e);    
    }
  }

  /**
   * Get status subscription for given channel. Status available on
   * PubSubHubBub official webpage. Access it by GET request with
   * query parameters of callbackUrl and topicUrl and parse this page
   * with RegExp. Statuses: 'verified', 'unverified', 'unsubscribed' and 'expired'.
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
      console.error('Subscription status error:\n', e);
    }
  }

  static async subscribe(name: string, channel_id: string): Promise<void> {
    const resp = await YouTubeSubscription.sendPshbRequest(channel_id, 'subscribe');
    const isSuccess = resp && resp.status === 202;

    if (!isSuccess) throw `Error subscribing to "${name} (${channel_id})"`;

    await DataService.addChannel(name, channel_id);
  }

  static async resubscribe(channel: Channel): Promise<void> {
    const {id, name, channel_id} = channel;
    const resp = await YouTubeSubscription.sendPshbRequest(channel_id, 'subscribe');
    const isSuccess = resp && resp.status === 202;

    if (!isSuccess) throw `Error resubscribing to "${name} (${channel_id})"`;

    const subscribed_date = Date.now();
    await DataService.editChannel(id, {subscribed_date});
  }

  static async unsubscribe(channel: Channel): Promise<void> {
    const {id, name, channel_id} = channel;
    const resp = await YouTubeSubscription.sendPshbRequest(channel_id, 'unsubscribe');
    const isSuccess = typeof resp !== 'undefined' && resp?.ok;

    if (!isSuccess) throw `Error unsubscribing to "${name} (${channel_id})"`;

    await DataService.deleteChannel(id);
  }

  static async renew(channel: Channel): Promise<void> {
    const {id,channel_id, name} = channel;
    let resp: Response | void;

    try {
      resp = await YouTubeSubscription.sendPshbRequest(channel_id, 'unsubscribe');
      if (typeof resp === 'undefined' || !resp.ok) throw 'Error unsubscribing';

      resp = await YouTubeSubscription.sendPshbRequest(channel_id, 'subscribe');
      if (typeof resp === 'undefined' || !resp.ok) throw 'Error subscribing';

      const newSubscribeDate = Date.now();
      await DataService.editChannel(id, {subscribed_date: newSubscribeDate});
    } catch (error) {
      console.log(`Error renewing channel "${name} (${channel_id})":\n`, error);
    }
  }

  /**
   * Checks channels to see if renewal is required
   */
  static async run(): Promise<void> {
    try {
      const currentDate = Date.now();
      const channels = await DataService.getChannels();

      for (const channel of channels) {
        const {channel_id, subscribed_date} = channel;
        const subscribedDate = new Date(subscribed_date).getTime();
        const subscribedInterval = currentDate - subscribedDate;
        const exceededSubInterval = subscribedInterval >= this.maxSubInterval;

        if (exceededSubInterval) {
          await YouTubeSubscription.renew(channel);
          continue;
        } 

        const status = await YouTubeSubscription.getStatus(channel_id);

        if (status === ChannelStatus.UNVERIFIED) {
          await YouTubeSubscription.resubscribe(channel);
          continue;
        }
      }
    } catch(e) {
      console.error(e);
    }
  }
}