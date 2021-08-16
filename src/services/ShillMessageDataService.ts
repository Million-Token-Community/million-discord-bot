import * as Airtable from 'airtable';
import {FieldSet} from 'airtable/lib/field_set';
import {QueryParams} from 'airtable/lib/query_params';
import Record from 'airtable/lib/record';

export interface ShillMessage {
  id: string;
  name: string;
  content: string;
}

export class ShillMessageDataService {
  static readonly table = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY
    })
    .base('apph8Ekdivj4iBcKd')('shill_messages');

  static async getAllShillMessages(): Promise<ShillMessage[]> {
    const messages: ShillMessage[] = [];

    const queryParams: QueryParams<FieldSet> = {
      view: 'Grid view',
      cellFormat: 'json'
    } 

    const records = await this.table
      .select(queryParams)
      .all();

    records.forEach(record => {
      const content = record.get('content') as string;
      const expiry = record.get('expiry') as string;
      const currentDate = Date.now();
      let expiredDate = -Infinity;

      if (typeof expiry === 'string') {
        expiredDate = Date.parse(expiry);
      }

      const hasContent = typeof content === 'string';
      const contentHasExpired = currentDate >= expiredDate;
      
      if (hasContent && !contentHasExpired) {
        messages.push(this.shillMessage(record));
      }
    });

    return messages;
  }

  static async getShillMessageById(id: string): Promise<ShillMessage> {
    const record = await this.table.find(id);
    return this.shillMessage(record);
  }

  static async getMessageByName(name: string): Promise<unknown> {
    const records = await this.table
      .select({filterByFormula: `{name} = '${name}'`})
      .firstPage();

    return records[0]?._rawJson;
  }

  static async createShillMessage(name: string, content: string): Promise<ShillMessage> {
    const exists = await this.getMessageByName(name);

    if (exists) throw {
      title: 'Error creating message',
      message: `message name "${name}" already being used`
    };

    const record = await this.table.create({name, content});

    return this.shillMessage(record);
  }

  static async editShillMessage(
    id: string, 
    fields: {
      name?: string, 
      content?: string
  }): Promise<ShillMessage> {
    const record = await this.table.update(id, fields)
    return this.shillMessage(record);
  }

  static async deleteMessage(id: string): Promise<ShillMessage> {
    const record = await this.table.destroy(id);
    return this.shillMessage(record);
  }

  static shillMessage(record: Record<FieldSet>): ShillMessage {
    return {
      id: record.getId(),
      name: record.get('name') as string,
      content: record.get('content') as string
    }
  }
}