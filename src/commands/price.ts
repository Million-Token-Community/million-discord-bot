import { CommandContext, SlashCommand } from 'slash-create';
import {MillionStatsService} from '../services/MillionStatsService';
const Discord = require('discord.js');

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
      //commandResponse = `<:mm:861734660081451018> Price is **$${price}** (${priceChange}%).`;
      //await ctx.send(commandResponse);

      //TODO test this
      exampleEmbed = new Discord.MessageEmbed()
      .setColor('#6200EA')//DeepPurple50 (A700)
      .addField(`<:mm:861734660081451018> MM Price`, `**$${price}** (${priceChange}%)`)

      await ctx.send({embeds: [exampleEmbed], ephemeral: true});

    } catch (error) {
      console.log('"price" command error:\n', error);
      exampleEmbed = new Discord.MessageEmbed()
      .setColor('#6200EA')//DeepPurple50 (A700)
      .addField(`Something went wrong`, `try again a bit later.`)
      await ctx.send({embeds: [exampleEmbed], ephemeral: true});//TODO test this
    }

  }
};
