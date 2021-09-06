import * as Airtable from 'airtable';
import { FieldSet } from 'airtable/lib/field_set';
import { QueryParams } from 'airtable/lib/query_params';
import Record from 'airtable/lib/record';

export interface Channel extends Fields {
  id: string
}

export interface Fields {
  name: string
  channel_id: string
}

export class DataService {
  static readonly table = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY
    })
    .base('appBVyMlXmTPsLPYv')('youtube_channels');

  static async getChannels(): Promise<Channel[]> {
    const items: Channel[] = [];

    const queryParams: QueryParams<FieldSet> = {
      view: 'Grid view',
      cellFormat: 'json'
    } 

    const records = await this.table
      .select(queryParams)
      .all();

    records.forEach(record => {
      items.push(this.channel(record));
    });
    return items;
  }

  static async getChannelById(id: string): Promise<Channel> {
    const record = await this.table.find(id);
    return this.channel(record);
  }

  static async getChannelByName(name: string): Promise<Channel | void> {
    const records = await this.table
      .select({ filterByFormula: `{name} = '${name}'` })
      .firstPage();
    const record = records[0]?._rawJson;
    if (!record) {
      return;
    }

    const { id, fields } = record;
    return {
      id,
      name: fields.name,
      channel_id: fields.channel_id
    }
  }

  static async getChannelByChannelId(channel_id: string): Promise<Channel | void> {
    const records = await this.table
      .select({ filterByFormula: `{channel_id} = '${channel_id}'` })
      .firstPage();
    const record = records[0]?._rawJson;
    if (!record) {
      return;
    }

    const { id, fields } = record;
    return {
      id,
      name: fields.name,
      channel_id: fields.channel_id
    }
  }

  static async isExists(name: string, channel_id: string): Promise<boolean> {
    const nameExists = await this.getChannelByName(name);
    
    const channelIsExists = await this.getChannelByChannelId(channel_id);
    return (nameExists || channelIsExists) ? true : false;
  }

  static async addChannel(name: string, channel_id: string): Promise<Channel> {
    const record = await this.table.create({ name, channel_id });
    return this.channel(record);
  }

  static async editChannel(
    id: string, 
    fields: {
      name?: string, 
      channel_id?: string
  }): Promise<Channel> {
    const record = await this.table.update(id, fields)
    return this.channel(record);
  }

  static async deleteChannel(id: string): Promise<Channel> {
    const record = await this.table.destroy(id);
    return this.channel(record);
  }

  static channel(record: Record<FieldSet>): Channel {
    return {
      id: record.getId(),
      name: record.get('name') as string,
      channel_id: record.get('channel_id') as string
    }
  }
}