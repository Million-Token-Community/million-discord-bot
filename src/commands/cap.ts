import { SlashCommand, CommandContext, MessageEmbedOptions} from 'slash-create';
import fetch from 'node-fetch';
import { formatLargeNumber } from '../utils';
import { cache } from '../cache';
import {channelIds} from '../channel-IDs';

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'cap',
      description: 'Get current cap (as a millionaire).',
      guildIDs: [process.env.GUILD_ID],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    if (!this.isBotCommandsChannel(ctx)) {
      this.createError(
        'Access denied',
        `This command cannot be used in this channel.`
      );
    }

    try {

      const apiUrl =
      'https://api.coingecko.com/api/v3/coins/million?tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false';
    const init = {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    const cacheKey = 'cap';

    let commandResponse;

    try {
      if (await cache.has(cacheKey)) {
        commandResponse = await cache.get(cacheKey);
      } else {
        const response = await fetch(apiUrl, init);
        const responseBody = await response.json();
        const marketCapUsd = responseBody.market_data.market_cap.usd;

        commandResponse = `:billed_cap: Market cap is **$${formatLargeNumber(
          marketCapUsd,
        )}**.`;

        await cache.set(cacheKey, commandResponse);
        await ctx.send(commandResponse);
      }
    } catch {
      commandResponse = `Something is wrong - try again a bit later.`;
      await ctx.send(commandResponse, {ephemeral: true});
    }


    } catch (error){
      console.log('MANAGE_MESSAGE_ERROR:\n', error);
      const embed = this.createStatusEmbed(
        error.title || 'Error',
        error.message || 'Something went wrong - try again later...',
        true
      );
    
      return await ctx.send({embeds: [embed], ephemeral: true});
    }
    
  }


  isBotCommandsChannel(ctx: CommandContext) {
    return ctx.channelID === channelIds.botCommandsChannel;
  }

  createStatusEmbed(title: string, message: string, error = false): MessageEmbedOptions {
    const color = error ? 16711680 : 65280;
    const mainTitle = error ? 'Error' : 'Success';

    return {
      color: color,
      title: mainTitle, 
      fields: [
        {
          name: title, 
          value: message
        }
      ]
    }
  }

};
