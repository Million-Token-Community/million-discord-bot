import { CommandContext, SlashCommand, MessageEmbedOptions } from 'slash-create';
import {MillionStatsService} from '../services/MillionStatsService';

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
    try {
      const resp = await MillionStatsService.getHolders();

      if (resp.hasError) throw resp.error;

      const embedOptions: MessageEmbedOptions = {
        title: '<:pepeholdmm:861835461458657331> Holders count: ' + resp.data.totalHodlers,
        fields: [
          {
            inline: false,
            name: 'UniSwap',
            value: resp.data.uniswap
          },
          {
            inline: false,
            name: 'BSC',
            value: resp.data.bsc
          },
          {
            inline: false,
            name: 'Polygon',
            value: resp.data.polygon
          },
          {
            inline: false,
            name: 'Solana',
            value: resp.data.solana
          }
        ]
      }

      return await ctx.send({embeds: [embedOptions]})
    } catch (error) {
      console.log('"holders" command error: \n', error);
      return await ctx.send(
        `Something went wrong - try again a bit later.`,
        {ephemeral: true}
      );
    }
  }
};
