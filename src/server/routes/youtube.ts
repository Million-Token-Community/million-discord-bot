import * as express from "express";
import { Client, TextChannel } from "discord.js";
import { channelIds } from "../../channel-IDs";

export interface RawPublication {
  [key: string]: unknown
}

export interface Publication {
  title: string,
  author: string,
  channelUrl: string,
  channelId: string,
  videoId: string, 
  videoUrl: string, 
  publishedDate: string, 
  updatedDate: string
}

export const youtube = express.Router();

youtube.get('/notification', ({ query: { 'hub.challenge': challenge } }, res) => {
  res.status(200).end(challenge);
});

youtube.post('/notification', ({ body, app }, res) => {
  try {
    const publications = body.feed.entry;
    
    if (!publications) {
      throw new Error('Request without publication');
    };
    
    const discordClient = app.get('discordClient') as Client;

    if (!(discordClient instanceof Client)) {
      throw {
        title: 'Discord client error',
        message: 'discordCleint in not Client instance'
      }
    }

    const parsePublications = (pub: RawPublication): Publication => {
      return {
        title: pub.author[0].name[0],
        author: pub.author[0].uri[0],
        channelUrl: pub.author[0].uri[0],
        channelId: pub['yt:channelid'][0],
        videoId: pub['yt:videoid'][0], 
        videoUrl: pub.link[0]['$'].href, 
        publishedDate: pub.published[0], 
        updatedDate: pub.updated[0]
      }
    };
  
    publications.forEach(async (pub: RawPublication) => {
      const { title, videoUrl, publishedDate, updatedDate } = parsePublications(pub);
      const { youTubePromotion } = channelIds;
      const pubDate = new Date(publishedDate);
      const upDate = new Date(updatedDate);
      
      try {
        const discordChannel = discordClient.channels.cache.get(youTubePromotion) as TextChannel;
  
        if (!discordChannel) {
          throw new Error(`Could not find channel with ID: ${youTubePromotion}`);
        }
        
        const msg = `${title} released new video!!\n` +
                    `Published: ${pubDate.toLocaleString('en-GB', { timeZone: 'UTC', timeZoneName: 'short' })}\n` +
                    `Updated: ${upDate.toLocaleString('en-GB', { timeZone: 'UTC', timeZoneName: 'short' })}\n` +
                    `<${videoUrl}>`;

        await discordChannel.send(msg);
      } catch(e) {
        console.error(e);
      }
    });

    res.status(200).end()
  } catch(e) {
    console.error(e);
    res.status(200).end()
  }
});