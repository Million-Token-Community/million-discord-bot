import { CommandContext, SlashCommand } from 'slash-create';
import {MillionStatsService} from '../services/MillionStatsService';
const Discord = require('discord.js');

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'holders',
      description: 'Get holder count (as a millionaire).',
      guildIDs: [process.env.GUILD_ID],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    let exampleEmbed;
    try {
      const resp = await MillionStatsService.getHolders();

      if (resp.hasError) throw resp.error;
      
      const numFormatter = new Intl.NumberFormat('en-US');
      const holders = numFormatter.format(resp.data);

      exampleEmbed = new Discord.MessageEmbed()
            .setColor('#C51162')//Pink50 (A700)
            .addField(`MM Hodlers <:pepeholdmm:861835461458657331>`, `${holders}`)

        return await ctx.send({embeds: [exampleEmbed], ephemeral: true});

    } catch (error) {
      console.log('"holders" command error: \n', error);
      exampleEmbed = new Discord.MessageEmbed()
      .setColor('#C51162')//Pink50 (A700)
      .addField(`Something went wrong`, `try again a bit later.`)
      return await ctx.send({embeds: [exampleEmbed], ephemeral: true});//TODO test this
    }
  }
};
