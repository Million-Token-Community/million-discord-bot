import { CommandContext, SlashCommand } from 'slash-create';
import {MillionStatsService} from '../services/MillionStatsService';

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
    let commandResponse;
    try {
      const resp = await MillionStatsService.getPriceData();
      //const resp = await new MillionStatsService().getPriceData_2();

      if (resp.hasError) throw resp.error;

      const {price, priceChange} = resp.data;
      commandResponse = `<:mm:861734660081451018> Price is **$${price}** (${priceChange}%).`;
    } catch (error) {
      console.log('"price" command error:\n', error);
      commandResponse = `Something went wrong - try again a bit later.`;
    }

    await ctx.send(commandResponse);
  }
};
