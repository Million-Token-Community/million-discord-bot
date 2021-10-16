import { SlashCommand, CommandContext} from 'slash-create';
import fetch from 'node-fetch';
import { formatLargeNumber } from '../utils';
import { cache } from '../cache';
import * as Discord from 'discord.js';

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
      const apiUrl =
      'https://api.coingecko.com/api/v3/coins/million?tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false';
    const init = {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    const cacheKey = 'cap';

    let exampleEmbed;

    try {
      if (await cache.has(cacheKey)) {
        exampleEmbed = await cache.get(cacheKey);
      } else {
        const response = await fetch(apiUrl, init);
        const responseBody = await response.json();
        const marketCapUsd = responseBody.market_data.market_cap.usd;

        exampleEmbed = new Discord.MessageEmbed()
            .setColor('#AA00FF')//purple50 (A700)
            .addField(`MM Market Cap :billed_cap:`, `${formatLargeNumber(marketCapUsd)}`)

        await cache.set(cacheKey, exampleEmbed);
        await ctx.send({embeds: [exampleEmbed], ephemeral: true});
      }
    } catch {
      exampleEmbed = new Discord.MessageEmbed()
      .setColor('#AA00FF')//purple50 (A700)
      .addField(`Something went wrong`, `try again a bit later.`)
      await ctx.send({embeds: [exampleEmbed], ephemeral: true});
    }


    
  }




};
