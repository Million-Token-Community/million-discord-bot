import * as Airtable from 'airtable';
import { FieldSet } from 'airtable/lib/field_set';
import { QueryParams } from 'airtable/lib/query_params';
import Record from 'airtable/lib/record';
import Table from 'airtable/lib/table';

export interface Channel extends Fields {
  id: string
}

export interface Fields {
  name: string
  channel_id: string
}

class _DataService {
  private table: Table<FieldSet>;

  constructor() {
    this.connectTable();
  }

  async connectTable(): Promise<void> {
    try {
      this.table = new Airtable({
        apiKey: process.env.AIRTABLE_API_KEY
      })
      .base('appBVyMlXmTPsLPYv')('youtube_channels');
    } catch (error) {
      console.log('Error connecting to database', error);
      
    }
    
  }

  async getChannels(): Promise<Channel[]> {
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

  async getChannelById(id: string): Promise<Channel> {
    const record = await this.table.find(id);
    return this.channel(record);
  }

  async getChannelByName(name: string): Promise<Channel | void> {
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

  async getChannelByChannelId(channel_id: string): Promise<Channel | void> {
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

  async isExists(name: string, channel_id: string): Promise<boolean> {
    const nameExists = await this.getChannelByName(name);
    
    const channelIsExists = await this.getChannelByChannelId(channel_id);
    return (nameExists || channelIsExists) ? true : false;
  }

  async addChannel(name: string, channel_id: string): Promise<Channel> {
    const record = await this.table.create({ name, channel_id });
    return this.channel(record);
  }

  async editChannel(
    id: string, 
    fields: {
      name?: string, 
      channel_id?: string
  }): Promise<Channel> {
    const record = await this.table.update(id, fields)
    return this.channel(record);
  }

  async deleteChannel(id: string): Promise<Channel> {
    const record = await this.table.destroy(id);
    return this.channel(record);
  }

  channel(record: Record<FieldSet>): Channel {
    return {
      id: record.getId(),
      name: record.get('name') as string,
      channel_id: record.get('channel_id') as string
    }
  }
}

export const DataService = new _DataService();