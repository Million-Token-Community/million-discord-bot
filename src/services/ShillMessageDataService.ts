import * as Airtable from 'airtable';
import {FieldSet} from 'airtable/lib/field_set';
import {QueryParams} from 'airtable/lib/query_params';

export interface ShillMessage {
  id: string;
  name: string;
  message: string;
}

export class ShillMessageDataService {
  static readonly table = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY
    })
    .base('apph8Ekdivj4iBcKd')('shill_messages');

  static async getAllShillMessages(): Promise<ShillMessage[]> {
    const items: ShillMessage[] = [];

    const queryParams: QueryParams<FieldSet> = {
      view: 'Grid view',
      cellFormat: 'json'
    } 

    const records = await this.table
      .select(queryParams)
      .all();

    records.forEach(record => {
      items.push({
        id: record.getId(),
        name: record.get('name') as string,
        message: record.get('message') as string
      });
    });

    return items;
  }

  static async getShillMessageById(id: string): Promise<unknown> {
    const record = await this.table.find(id);
    return record._rawJson
  }

  static async getMessageByName(name: string): Promise<unknown> {
    const records = await this.table
      .select({filterByFormula: `{name} = '${name}'`})
      .firstPage();

    return records[0]?._rawJson;
  }

  static async createShillMessage(name: string, message: string): Promise<unknown | undefined> {
    const exists = await this.getMessageByName(name);

    if (exists) return undefined;

    const records = await this.table.create([{fields: {
      name, message
    }}])

    return records[0]?._rawJson;
  }

  static async updateShillMessage(id: string, fields: Partial<FieldSet>): Promise<string | undefined> {
    const record = await this.table.update(id, fields)
    return record?.getId();
  }

  static async deleteMessage(id: string): Promise<unknown> {
    const record = await this.table.destroy(id);
    return record?._rawJson;
  }
}