import * as Airtable from 'airtable';
import Table from 'airtable/lib/table';
import {FieldSet} from 'airtable/lib/field_set';
import {baseId, apiKey} from '../config/airtable';
import Record from 'airtable/lib/record';

class SettingsDataService {
  table: Table<FieldSet>;
  
  constructor() {
    this.connectTable();
  }

  async connectTable(): Promise<void> {
    try {
      this.table = await new Airtable({apiKey: apiKey})
        .base(baseId)('settings');
    } catch (error) {
      console.log('Error connecting to "settings" table', error);
    }
  }

  async getSetting(name: string): Promise<string | undefined> {
    const records = await this.table
      .select({filterByFormula: `{name} = '${name}'`})
      .firstPage();

    const record = records[0];

    if (typeof record === 'undefined') {
      throw 'no records found';
    }
    
    return record.fields.value as string;
  }

  async editSetting(name: string, value: string): Promise<Record<FieldSet> | undefined> {
    const records = await this.table
      .select({filterByFormula: `{name} = '${name}'`})
      .firstPage();

    const record = records[0];

    if (typeof record === 'undefined') return undefined;
    if (record.fields.value === value) return record;

    const newRecord = await this.table.update(record.id, {value});
    return newRecord;
  }

  async getMillionStatsFormat(): Promise<string> {
    return await this.getSetting('million_stats_format') as string;
  }
}

export default new SettingsDataService();