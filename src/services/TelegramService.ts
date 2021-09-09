import nodeFetch, {RequestInit} from 'node-fetch';
import {hasJsonContentType} from '../utils'
import {ServiceResponse} from '../models/ServiceResponse';

export class TelegramService {
  static readonly baseUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
                         
  static async getMemberCount(): Promise<ServiceResponse<number>> {
    try {
      const url = `${this.baseUrl}/getChatMemberCount?chat_id=@millionjacuzzibar`;
      const fetchOptns: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      } 

      const resp = await nodeFetch(url, fetchOptns);
      const isRespOk = resp.ok;
      const hasJson = hasJsonContentType(resp);
      const isValidResponse = isRespOk && hasJson;
      
      if (!isValidResponse) {
        throw new Error('Response is not valid.');
      }

      const respBody = await resp.json();
      const memberCount = respBody?.result;
      const isValidMemberCount = typeof memberCount === 'number';

      if (!isValidMemberCount) {
        throw new Error('memberCount must be a number');
      }
      
      return new ServiceResponse(memberCount);
    } catch (error) {
      return new ServiceResponse(null, error);
    }
  }
}