import * as Airtable from 'airtable';
import {FieldSet} from 'airtable/lib/field_set';
import {QueryParams} from 'airtable/lib/query_params';
import Record from 'airtable/lib/record';
import {ShillMessageAddon} from './ShillMessageAddon';
import Table from 'airtable/lib/table';
import {baseId, apiKey} from '../config/airtable';

export interface ShillMessage {
  id: string;
  name: string;
  content: string;
}

class _ShillMessageDataService {
  private table: Table<FieldSet>;
  
  constructor() {
    this.connectTable();
  }

  async connectTable(): Promise<void> {
    try {
      this.table = await new Airtable({apiKey: apiKey})
        .base(baseId)('shill_messages');
    } catch (error) {
      console.log('SHILL MESSAGE DATA SERVCE ERROR', error);
    }
  }
  

  async getAllShillMessages(): Promise<ShillMessage[]> {
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

      let expiredDate = Infinity;

      if (typeof expiry === 'string') {
        expiredDate = Date.parse(expiry);
      }

      const isValidContent = typeof content === 'string';
      const contentHasExpired = currentDate >= expiredDate;
      
      if (isValidContent && !contentHasExpired) {
        messages.push(this.formatShillMessage(record));
      }
    });

    return messages;
  }

  async getShillMessageById(id: string): Promise<ShillMessage> {
    const record = await this.table.find(id);
    return this.formatShillMessage(record);
  }

  async getMessageByName(name: string): Promise<ShillMessage | undefined> {
    const records = await this.table
      .select({filterByFormula: `{name} = '${name}'`})
      .firstPage();

    const record = records[0];

    if (typeof record === 'undefined') {
      return record;
    }

    const shillMessage = this.formatShillMessage(record);
    const hasAddon = ShillMessageAddon.hasAddon(shillMessage.name);

    if (hasAddon) {
      const modifiedContent = await ShillMessageAddon[shillMessage.name](shillMessage.content);
      shillMessage.content = modifiedContent;
    }

    return shillMessage;
  }

  async createShillMessage(name: string, content: string): Promise<ShillMessage> {
    const exists = await this.getMessageByName(name);

    if (exists) throw {
      title: 'Error creating message',
      message: `message name "${name}" already being used`
    };

    const record = await this.table.create({name, content});

    return this.formatShillMessage(record);
  }

  async editShillMessage(
    id: string, 
    fields: {
      name?: string, 
      content?: string
  }): Promise<ShillMessage> {
    const record = await this.table.update(id, fields)
    return this.formatShillMessage(record);
  }

  async deleteMessage(id: string): Promise<ShillMessage> {
    const record = await this.table.destroy(id);
    return this.formatShillMessage(record);
  }

  formatShillMessage(record: Record<FieldSet>): ShillMessage {
    const id = record.getId();
    const name = record.get('name') as string;
    const content = record.get('content') as string;

    const isValidFields = typeof name === 'string'
      && typeof content === 'string';

    if (!isValidFields) {
      throw new Error('Record contains invalid fields');
    }

    return {
      id,
      name,
      content
    }
  }
}

export const ShillMessageDataService = new _ShillMessageDataService();