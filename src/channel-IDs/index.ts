import {devChannelIds} from './devChannelIds';
import {prodChannelIds} from './prodChannelIds';

export const channelIds = process.env.NODE_ENV === 'production'
  ? prodChannelIds 
  : devChannelIds;
