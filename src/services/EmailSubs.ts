import * as Airtable from 'airtable';
import {FieldSet} from 'airtable/lib/field_set';
import {QueryParams} from 'airtable/lib/query_params';
import {baseId, apiKey} from '../config/airtable';

export class EmailSubsService {
  static readonly table = new Airtable({apiKey: apiKey})
    .base(baseId)('email_subs');

  static async getSubsCount(): Promise<number> {
    const queryParams: QueryParams<FieldSet> = {
      view: 'Grid view',
      cellFormat: 'json'
    } 

    const records = await this.table
      .select(queryParams)
      .all();

    return records[0].get('count') as number;
  }
}