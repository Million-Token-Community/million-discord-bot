import nodeFetch, { Response } from 'node-fetch';
import * as FormData from 'form-data';

export class YouTubeSubscription {
  static async sendPshbRequest(channelId: string, mode: string): Promise<Response | void>{
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
}