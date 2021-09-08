import { production } from './production';
import { development } from './development'; // get template from 'example.ts'

export const isProduction = process.env.NODE_ENV === 'production';

export const { channelIds, roleIds } = isProduction ? production : development;

export const token = process.env.TOKEN;

export const applicationId = process.env.APPLICATION_ID;

export const publicKey = process.env.PUBLIC_KEY;

export const guildId = process.env.GUILD_ID;

export const nomicsApiToken = process.env.NOMICS_API_TOKEN;

export const covalentApiKey = process.env.COVALENT_API_KEY;

export const ethGasKey = process.env.ETH_GAS_KEY;

export const airTableApiKey = process.env.AIRTABLE_API_KEY;

export const twitterKey = process.env.TWITTER_KEY;

export const redditClientId = process.env.REDDIT_CLIENT_ID;

export const redditSecret = process.env.REDDIT_SECRET;

export const redditUsername = process.env.REDDIT_USERNAME;

export const redditPassword = process.env.REDDIT_PASSWORD;

export const hostname = process.env.HOSTNAME;
