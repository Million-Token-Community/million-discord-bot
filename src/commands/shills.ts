import { SlashCommand, CommandContext, CommandOptionType } from 'slash-create';
import {ShillMessageDataService} from '../services/ShillMessageDataService';
import {createStatusEmbed, hasAllowedRoles} from '../utils';
import { roleIds, guildId } from '../config';

const { leadAdmin, admin, leadAmbassador, leadDev } = roleIds;

module.exports = class HelloCommand extends SlashCommand {
  allowedRoles = [
    leadAdmin,
    admin,
    leadAmbassador,
    leadDev
  ]

  constructor(creator) {
    super(creator, {
      name: 'shills',
      description: 'Send shill messages.',
      guildIDs: [guildId],
      options: [
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'send',
          description: 'Send shill message',
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'name',
              description: 'Shill message name',
              required: true
            }
          ]
        },
        
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'list',
          description: 'List all available shill messages',
        },
      ]
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    try {
      const isAllowed = hasAllowedRoles(ctx, this.allowedRoles);

      if (!isAllowed) {
        const embed = createStatusEmbed(
          'Access Denied',
          'You do not have permission to use this command',
          true
        );

        return ctx.send({
          embeds: [embed],
          ephemeral: true
        })
      }

      if (ctx.options.list) {
        return await this.listShills(ctx);
      }

      if (ctx.options.send) {
        return await this.getShillByName(ctx);
      }

      return await ctx.send('Invalid command', {ephemeral: true});
    } catch (error) {
      console.log('SHILL_COMMAND_ERROR:\n', error);

      const embed = createStatusEmbed(
        'Error',
        error.message || 'Something went wrong - try again later...',
        true
      )

      return await ctx.send({
        embeds: [embed],
        ephemeral: true
      });
    }
  }

  async listShills(ctx: CommandContext) {
    const shillsMessages = await ShillMessageDataService.getAllShillMessages();
    let names = '';

    shillsMessages.forEach((shill) => {
      names += `${shill.name}\n`
    });

    return ctx.send('**Shill Messages:**\n\n' + names, {ephemeral: true});
  }

  async getShillByName(ctx: CommandContext) {
    const {send: {name}} = ctx.options;
    const shillMessage = await ShillMessageDataService.getMessageByName(name);

    if (typeof shillMessage === 'undefined') {
      const embed = createStatusEmbed(
        'Shill Command Error',
        `Could not find shill message with name "${name}"`,
        true
      );

      return await ctx.send({embeds: [embed], ephemeral: true});
    }
    
    return await ctx.send(shillMessage.content);
  }
};
