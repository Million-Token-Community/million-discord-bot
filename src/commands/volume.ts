import { CommandContext, SlashCommand } from 'slash-create';
import fetch from 'node-fetch';
import { formatLargeNumber, formatPercentageChange } from '../utils';
import { cache } from '../cache';
import * as Discord from 'discord.js';

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'volume',
      description: 'Get 24h volume (as a millionaire).',
      guildIDs: [process.env.GUILD_ID],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    const apiUrl = `https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API_TOKEN}&ids=MM4`;
    const init = {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    const cacheKey = 'volume';

    let exampleEmbed;

    try {
      if (await cache.has(cacheKey)) {
        exampleEmbed = await cache.get(cacheKey);
      } else {
        const response = await fetch(apiUrl, init);
        const responseBody = await response.json();
        const dailyData = responseBody[0]['1d'];
        const volume = dailyData.volume;
        const volumeChange = dailyData.volume_change_pct;

      exampleEmbed = new Discord.MessageEmbed()
      .setColor('#64FFDA')//Teal (A200)
      .addField(`MM 24h Volume`, `$${formatLargeNumber(volume,)} (${formatPercentageChange(volumeChange)}%)`)

      await cache.set(cacheKey, exampleEmbed);
      await ctx.send({embeds: [exampleEmbed], ephemeral: true});
        
        
      }
    } catch (error) {
      exampleEmbed = new Discord.MessageEmbed()
      .setColor('#64FFDA')//Teal (A200)
      .addField(`Something went wrong`, `try again a bit later.`)
      await ctx.send({embeds: [exampleEmbed], ephemeral: true});
    }
  }
};
