import * as express from "express";
import { channelIds } from "../../../channel-IDs";

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
    
    const discordClient = app.get('discordClient');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsePublications = (pub: any) => {
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
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publications.forEach(async (pub: any) => {
      const { title, videoUrl } = parsePublications(pub);
      const { youTubePromotion } = channelIds;
      
      try {
        const discordChannel = discordClient.channels.cache.get(youTubePromotion);
  
        if (!discordChannel) {
          throw new Error(`Could not find channel with ID: ${youTubePromotion}`);
        }
        
        const msg = `${title} released new video!!\n` +
                    `${videoUrl}`;

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