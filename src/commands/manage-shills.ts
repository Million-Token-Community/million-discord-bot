import { 
  SlashCommand, 
  CommandContext, 
  MessageEmbedOptions
} from 'slash-create';
import { ShillMessageDataService, ShillMessage } from '../services/ShillMessageDataService';
import {client} from '../discordClient';
import { Message, TextChannel } from 'discord.js';
import {commandOptions} from './manage-shills.command-options'
import {recuringShills} from '../tasks/Announcements/RecurringShills'
import { roleIds, channelIds, guildId } from '../config';

const { leadAdmin, admin, leadAmbassador, leadDev } = roleIds;

module.exports = class ManageShillsCommands extends SlashCommand {
  //  only allow Lead Admins, Admins, Lead Dev, and Lead Ambassador
  allowedRoles = [          
    leadAdmin,  
    admin,   
    leadAmbassador,    
    leadDev    
  ];

  constructor(creator) {
    super(creator, {
      name: 'manage_messages',
      description: 'View messages and reset message cache',
      guildIDs: [guildId],
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

      if (ctx.options.update_cache) {
        return await this.updateShillMessageCache(ctx);
      }

      return await ctx.send('No command selected', {ephemeral: true});
    } catch (error) {
      console.log('MANAGE_MESSAGE_ERROR:\n', error);

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

  async getChatMessage(id: string): Promise<Message> {
    const channel = await client
      .channels
      .fetch(channelIds.botCommandsChannel) as TextChannel;

    return await channel.messages.fetch(id);
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
    const {name, message_id}: {name: string, message_id: string} = ctx.options.create;
    const chatMessage: Message = await this.getChatMessage(message_id);

    const shillMessage = await ShillMessageDataService
      .createShillMessage(name, chatMessage.content);

    const embed = this.createStatusEmbed(
      'New message created',
      this.formatMessage(shillMessage, false)
    );
    
    await chatMessage.react('✅');
    await ctx.send({embeds: [embed], ephemeral: true});
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

    let chatMessage: Message | null = null;
    if (message_id) {
      chatMessage = await this.getChatMessage(message_id);
      fields['content'] = chatMessage.content;
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
  
    if (chatMessage) {
      await chatMessage.react('☑️');
    }

    await ctx.send({embeds: [embed], ephemeral: true});
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
    await recuringShills.reset();

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