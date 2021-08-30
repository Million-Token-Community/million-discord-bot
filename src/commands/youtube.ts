import { SlashCommand, SlashCreator, CommandContext, CommandOptionType, MessageEmbedOptions } from 'slash-create';
import { YouTubeSubscription } from '../tasks/Promotions/YouTube/Subscription';
import { DataService } from '../tasks/Promotions/YouTube/DataService';
import { rolesIds } from '../roles';

export class YouTubeCommand extends SlashCommand {
  private allowedRoles: string[]

  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'youtube',
      description: 'YouTube realated commands',
      guildIDs: [process.env.GUILD_ID],
      options: [
        {
          name: 'subscribe',
          description: 'Subscribe to a YouTube channel',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'name',
              description: 'channel name',
              required: true
            },
            {
              type: CommandOptionType.STRING,
              name: 'channel_id',
              description: 'channel ID',
              required: true
            }
          ]
        },
        {
          name: 'unsubscribe',
          description: 'Unsubscribe from a YouTube channel',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'name',
              description: 'channel name',
              required: true
            },
          ]
        },
        {
          name: 'find',
          description: 'Check channel subscription',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'name',
              description: 'channel name',
              required: true
            },
          ]
        }
      ]
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
    this.allowedRoles = [
      rolesIds.admins,
      rolesIds.leadAdmin,
      rolesIds.leadAmbassador,
      rolesIds.leadDev,
      rolesIds.testRole
    ]
  }

  async run(ctx: CommandContext): Promise<void> {
    try {

      if (!this.hasAllowedRoles(ctx)) {
        throw {
          title: 'Access denied',
          message: `You do not have access to this command.`
        }
      }

      const { subscribe, unsubscribe, find } = ctx.options;

      if (subscribe) {
        await this.subscribe(ctx);
      }

      if (unsubscribe) {
        await this.unsubscribe(ctx);
      }

      if (find) {
        await this.find(ctx);
      }

    } catch(e) {
      console.error(e);
      const embed = this.createStatusEmbed(
        e.title || 'Error',
        e.message || 'Something went wrong - try again later...',
        true
      );

      await ctx.send({embeds: [embed], ephemeral: true});
    }
  }

  async subscribe(ctx: CommandContext): Promise<void> {
    const { name, channel_id } = ctx.options.subscribe;

    const recordByName = await DataService.getChannelByName(name);

    if (recordByName) {
      throw {
        title: 'Channel exists',
        message: `Channel: "${recordByName.name}" with ID: "${recordByName.channel_id}" already being used`
      }
    }

    const recordByChannelId = await DataService.getChannelByChannelId(channel_id);

    if (recordByChannelId) {
      throw {
        title: 'Channel exists',
        message: `Channel: "${recordByChannelId.name}" with ID: "${recordByChannelId.channel_id}" already being used`
      }
    }

    const mode = 'subscribe';
    const res = await YouTubeSubscription.sendPshbRequest(channel_id, mode);
    const isSuccess = res && res.status === 202;
    let embed: MessageEmbedOptions;

    if (isSuccess) {
      embed = this.createStatusEmbed('Subscribed to', `${name} channel`);
      await DataService.addChannel(name, channel_id);
    } else {
      embed = this.createStatusEmbed('Failed to subscribe to', `${name} channel`, true);
    }

    await ctx.send({embeds: [embed], ephemeral: true});
  }

  async unsubscribe(ctx: CommandContext): Promise<void> {
    const { name } = ctx.options.unsubscribe;
    const record = await DataService.getChannelByName(name);

    if (!record) {
      throw {
        title: 'Channel not found',
        message: `There is no channel: "${name}"`
      }
    }

    const { id, channel_id } = record;
    const mode = 'unsubscribe';
    const res = await YouTubeSubscription.sendPshbRequest(channel_id, mode);
    const isSuccess = res && res.status === 202;
    let embed: MessageEmbedOptions;

    if (isSuccess) {
      embed = this.createStatusEmbed('Unsubscribed from', `${name} channel`);
      await DataService.deleteChannel(id);
    } else {
      embed = this.createStatusEmbed('Failed to unsubscribe from', `${name} channel`, true);
    }

    await ctx.send({embeds: [embed], ephemeral: true});
  }

  async find(ctx: CommandContext): Promise<void> {
    const { name } = ctx.options.find;
    const record = await DataService.getChannelByName(name);
    let embed: MessageEmbedOptions;

    if (record) {
      embed = this.createStatusEmbed('Active subscription for:', `Channel: ${record.name}\nID: ${record.channel_id}`);
    } else {
      embed = this.createStatusEmbed('Channel not found', `There is no channel: "${name}"`, true);
    }

    await ctx.send({embeds: [embed], ephemeral: true});
  }

  hasAllowedRoles(ctx: CommandContext): boolean {
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
};