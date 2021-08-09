import { 
  SlashCommand, 
  CommandContext, 
  MessageEmbedOptions
} from 'slash-create';
import { ShillMessageDataService, ShillMessage } from '../services/ShillMessageDataService';
import { cache } from '../cache';
import {channelIds} from '../channel-IDs'
import {client} from '../discordClient';
import { Message, TextChannel } from 'discord.js';
import {commandOptions} from './manage-shills.command-options'

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
      options: commandOptions
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx: CommandContext): Promise<unknown> {
    try {
      if (!this.isBotCommandsChannel(ctx)) {
        this.createError(
          'Access denied',
          `This command cannot be used in this channel.`
        );
      }

      if (!this.hasAllowedRoles(ctx)) {
        this.createError(
          'Access denied',
          `You do not have access to this command.`
        );
      }

      console.log(ctx.options);

      if (ctx.options.list?.shill_id) {
        return await this.listSingleMessage(ctx);
      }

      if (ctx.options.list) {
        return await this.listAllMessages(ctx);
      }

      if (ctx.options.create) {
        return await this.createMessage(ctx);
      }

      if (ctx.options.edit) {
        return await this.editMessage(ctx);
      }

      if (ctx.options.delete) {
        return await this.deleteMessage(ctx);
      }

      return await ctx.send('No command selected', {ephemeral: true});
    } catch (error) {
      console.log('MANAGE_MESSAGE_ERROR:', error);

      const embed = this.createStatusEmbed(
        error.title || 'Error',
        error.message || 'Something went wrong - try again later...',
        true
      );
    
      return await ctx.send({embeds: [embed], ephemeral: true});
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
    const mainTitle = error ? 'Error' : 'Success';

    return {
      color: color,
      title: mainTitle, 
      fields: [
        {
          name: title, 
          value: message
        }
      ]
    }
  }

  formatMessage(shillMessage: ShillMessage, showContent = true) {
    let output = 
      `**Name:**\t${shillMessage.name}\n` + 
      `**ID:**\t${shillMessage.id}\n`;
      
    if (showContent) {
      output +=  `**Content:**\n\n` + shillMessage.content;
    }

    return output;
  }

  createError(title: string, message: string) {
    const err: ManageShillsCommandError = {title, message};

    throw err;
  }

  async listAllMessages(ctx: CommandContext) {
    const shillMessages: ShillMessage[] = await ShillMessageDataService
      .getAllShillMessages();

    if (!shillMessages.length) {
      return await ctx.send('No messages found.', {ephemeral: true});
    }

    const messages: string[] = [];

    shillMessages.forEach(entry => {
      messages.push(this.formatMessage(entry, false));
    });

    return await ctx.send(
      messages.join('---\n'), 
      {ephemeral: true}
    );
  }

  async listSingleMessage(ctx: CommandContext) {
    const id: string = ctx.options.list.shill_id;
    const message = await ShillMessageDataService.getShillMessageById(id);

    return await ctx.send(this.formatMessage(message), {ephemeral: true});
  }

  async createMessage(ctx: CommandContext) {
    const {name, content}: {name: string, content: string} = ctx.options.create;
    const message = await ShillMessageDataService
      .createShillMessage(name, content);

    const embed = this.createStatusEmbed(
      'New message created',
      this.formatMessage(message, false)
    );

    return await ctx.send({embeds: [embed], ephemeral: true});
  }

  async editMessage(ctx: CommandContext) {
    const {shill_id, message_id, name}: ShillMessageEditOptions = ctx.options.edit
    await ShillMessageDataService.getShillMessageById(shill_id);

    if (!name && !message_id) {
      this.createError(
        'Missing required fields', 
        '"name" or "content_id" required'
      );
    }

    const fields = {};

    if (message_id) {
      const channel = await client.channels.fetch(ctx.channelID) as TextChannel;
      const shillMessage = await channel.messages.fetch(message_id) as Message;
      fields['content'] = shillMessage.content;
    }

    if (name) {
      fields['name'] = name;
    }

    const shillMessage = await ShillMessageDataService
      .editShillMessage(shill_id, fields);

    const embed = this.createStatusEmbed(
      `Edit complete`,
      this.formatMessage(shillMessage, false)
    );
  
    return ctx.send({embeds: [embed], ephemeral: true});
  }

  async deleteMessage(ctx: CommandContext) {
    const shill_id: string = ctx.options.delete.shill_id;
    await ShillMessageDataService.getShillMessageById(shill_id);
    const deleted = await ShillMessageDataService.deleteMessage(shill_id);
    
    const embed = this.createStatusEmbed(
      'Delete success', 
      deleted.id
    );

    return await ctx.send({embeds: [embed], ephemeral: true});
  }

  async updateShillMessageCache(ctx: CommandContext) {
    const records = await ShillMessageDataService.getAllShillMessages();
    const messages: string[] = [];

    records.forEach(entry => {
      messages.push(entry.content);
    })

    await cache.set('shill_messages', messages, 0);
    const embed = this.createStatusEmbed(
      'Success', 
      'Cache has been updated.'
    );

    return await ctx.send({embeds: [embed], ephemeral: true});
  }
};

export interface ManageShillsCommandError {
  title: string;
  message: string;
}

export interface ShillMessageEditOptions {
  shill_id: string; 
  message_id: string; 
  name: string;
}