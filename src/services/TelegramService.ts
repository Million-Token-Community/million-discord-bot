import nodeFetch, {RequestInit} from 'node-fetch';

export class TelegramService {
  static readonly baseUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
                         
  static async getMemberCount(): Promise<number> {
    const url = `${this.baseUrl}/getChatMemberCount?chat_id=@MilliontokensOfficial`;
    const fetchOptns: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    } 

    const resp = await nodeFetch(url, fetchOptns);
    const respBody = await resp.json();

    if (!respBody.ok) throw `Telegram request failed`;

    return respBody.result as number;
  }
}