import { CommandContext, SlashCommand} from 'slash-create';
import {MillionStatsService} from '../services/MillionStatsService';
import * as Discord from'discord.js';

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
      const {data, hasError, error} = await MillionStatsService.getHolders();
      if (hasError) throw error;

      exampleEmbed = new Discord.MessageEmbed()
            .setColor('#C51162')//Pink50 (A700)
            .addField(
              `Total MM Hodlers <:pepeholdmm:861835461458657331>`, 
              `${data.totalHodlers}`, 
              false
            )
            .addField(
              'BSC',
              data.bsc,
              false
            )
            .addField(
              'Polygon',
              data.polygon,
              false
            )
            .addField(
              'Solana',
              data.solana,
              false
            )
            .addField(
              `Uniswap`,
              data.uniswap,
              false
            );
          
        return await ctx.send({embeds: [exampleEmbed], ephemeral: true});
    } catch (error) {
      console.log('"holders" command error: \n', error);
      exampleEmbed = new Discord.MessageEmbed()
      .setColor('#C51162')//Pink50 (A700)
      .addField(`Something went wrong`, `try again a bit later.`)
      return await ctx.send({embeds: [exampleEmbed], ephemeral: true});
    }
  }
};
