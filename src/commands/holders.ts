import { SlashCommand } from 'slash-create';
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

  async run(ctx) {
    try {
      const resp = await MillionStatsService.getHolders();

      if (resp.hasError) throw resp.error;
      
      const numFormatter = new Intl.NumberFormat('en-US');
      const holders = numFormatter.format(resp.data);      

      return await ctx.send(
        `<:pepeholdmm:861835461458657331> Current holders count is **${holders}**.`,
      );
    } catch (error) {
      console.log('"holders" command error: \n', error.message);
      return await ctx.send(`Something went wrong - try again a bit later.`);
    }
  }
};
