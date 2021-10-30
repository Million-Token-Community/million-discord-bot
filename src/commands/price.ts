import { CommandContext, SlashCommand } from 'slash-create';
import {MillionStatsService} from '../services/MillionStatsService';
import * as Discord from 'discord.js';

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'price',
      description: 'Get current price (as a millionaire).',
      guildIDs: [process.env.GUILD_ID],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx: CommandContext) { 
    let exampleEmbed;
    try {
      const resp = await MillionStatsService.getPriceData();

      if (resp.hasError) throw resp.error;

      const {price, priceChange} = resp.data;

      exampleEmbed = new Discord.MessageEmbed()
      .setColor('#6200EA')//DeepPurple50 (A700)
      .addField(`MM Price <:mm:861734660081451018>`, `$${price} (${priceChange}%)`)

      await ctx.send({embeds: [exampleEmbed], ephemeral: true});

    } catch (error) {
      console.log('"price" command error:\n', error);
      exampleEmbed = new Discord.MessageEmbed()
      .setColor('#6200EA')//DeepPurple50 (A700)
      .addField(`Something went wrong`, `try again a bit later.`)
      await ctx.send({embeds: [exampleEmbed], ephemeral: true});
    }

  }
};
