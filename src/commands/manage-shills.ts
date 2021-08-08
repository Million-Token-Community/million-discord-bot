import { 
  SlashCommand, 
  CommandContext, 
  CommandOptionType, 
  MessageEmbedOptions
} from 'slash-create';
import { ShillMessageDataService, ShillMessage } from '../services/ShillMessageDataService';
import { cache } from '../cache';
import {channelIds} from '../channel-IDs'

module.exports = class ManageShillsCommands extends SlashCommand {
  allowedRoles = [          //  only allow Lead Admins, Admins, Lead Dev, and Lead Marketer
    '872062467621138481', 
    '872062467621138479', 
    '872062467621138472', 
    '872062467612762139'
  ];

  constructor(creator) {
    super(creator, {
      name: 'manage_messages',
      description: 'View messages and reset message cache',
      guildIDs: [process.env.GUILD_ID],
      options: [
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'list',
          description: 'List all current messages',
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'update_cache',
          description: 'Updates message cache',
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'edit',
          description: 'Edit a message',
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'id',
              description: 'ID of stored message',
              required: true
            },
            {
              type: CommandOptionType.STRING,
              name: 'name',
              description: 'Name of message',
            },
            {
              type: CommandOptionType.STRING,
              name: 'content_id',
              description: 'The ID of the message to be used to update message in storage',
            },
          ]
        },
       
      ]
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx: CommandContext): Promise<unknown> {
    try {
      if (!this.isBotCommandsChannel(ctx)) {
        throw {
          title: 'Access denied',
          message: `This command can only be used in #bot-commands.`
        };
      }

      if (!this.hasAllowedRoles(ctx)) {
        throw {
          title: 'Access denied',
          message: `You do not have access to this command.`
        };
      }

      if (ctx.options.list) {
        return await this.listAllMessages(ctx);
      }

      if (ctx.options.update_cache) {
        return await this.updateShillMessageCache(ctx);
      }

      return await ctx.send('No command selected', {ephemeral: true});
    } catch (error) {
      
      let messageEmbed: MessageEmbedOptions = this.createStatusEmbed(
        'Error',
        'Try again later...',
        true
      );

      if (error.title && error.message) {
        messageEmbed = this.createStatusEmbed(error.title, error.message, true);
      }
    
      return await ctx.send({embeds: [messageEmbed], ephemeral: true});
    }
  }

  isBotCommandsChannel(ctx: CommandContext) {
    return ctx.channelID === channelIds.botCommandsChannel;
  }

  hasAllowedRoles(ctx: CommandContext) {
    let isAllowed = false;
    const memberRoles = ctx.member.roles;

    for (const memberRole of memberRoles) {
      if (this.allowedRoles.includes(memberRole)) {
        isAllowed = true;
        break;
      }
    }

    return isAllowed;
  }

  createStatusEmbed(title: string, message: string, error = false): MessageEmbedOptions {
    const color = error ? 16711680 : 65280;

    return {
      color: color,
      fields: [
        {
          name: title, 
          value: message
        }
      ]
    }
  }

  async listAllMessages(ctx: CommandContext) {
    const loungeMessages: ShillMessage[] = await ShillMessageDataService
      .getAllShillMessages();

    const messageArr = [];

    loungeMessages.forEach(entry => {
      messageArr.push(entry.message);
    });

    return await ctx.send(messageArr.join('\n\n---\n\n'), {ephemeral: true});
  }

  async updateShillMessageCache(ctx: CommandContext) {
    try {
      const records = await ShillMessageDataService.getAllShillMessages();
      const messages: string[] = [];

      records.forEach(entry => {
        messages.push(entry.message);
      })

      await cache.set('shill_messages', messages, 4 * 60 * 60 * 1000);
      const embed = this.createStatusEmbed('Success!', 'Cache has been updated.')

      return await ctx.send({embeds: [embed], ephemeral: true})
    } catch (error) {
      console.log(error);

      const embed = this.createStatusEmbed('Error', 'Error updating cache.', true);
      return await ctx.send({embeds: [embed], ephemeral: true});
    }
  }
};
