import {
  CommandContext,
  SlashCommand,
  SlashCreator,
  MessageEmbedOptions,
} from 'slash-create';
import fetch, {Response} from 'node-fetch';
import { cache } from '../cache';

module.exports = class GasCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'gas',
      description: `Gets current gas prices (as a millionaire)`,
      guildIDs: [process.env.GUILD_ID],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    const apiUrl = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETH_GAS_KEY}`;
    const init = {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    const cacheKey = 'gas';

    try {
      let responseBody: EthGasResponseBody;

      if (await cache.has(cacheKey)) {
        responseBody = (await cache.get(cacheKey)) as EthGasResponseBody;
      } else {
        const response: Response = await fetch(apiUrl, init);
        responseBody = await response.json();
        await cache.set(cacheKey, responseBody);
      }

      const {
        result: { SafeGasPrice, FastGasPrice, ProposeGasPrice },
      } = responseBody;

      const embed: MessageEmbedOptions = {
        title: ':fuelpump: Current Gas Prices (gwei)',
        color: 15509760,
        fields: [
          { name: 'Low', value: SafeGasPrice, inline: true },
          { name: 'Average', value: ProposeGasPrice, inline: true },
          { name: 'High', value: FastGasPrice, inline: true },
        ],
        footer: {
          text: 'Gas prices provided by etherscan.io',
        },
        timestamp: new Date(),
      };

      return await ctx.send({ embeds: [embed],  ephemeral: true });
    } catch {
      return await ctx.send(
        `Something is wrong - try again a bit later.`, 
        {ephemeral: true}
      );
    }
  }
};

interface EthGasResponseBody {
  result: {
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
  };
}
