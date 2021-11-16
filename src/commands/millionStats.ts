import { SlashCommand, CommandContext, CommandOptionType} from 'slash-create';
import SettingsDataService from '../services/SettingsDataService';
import {createStatusEmbed, hasAllowedRoles} from '../utils';
import {roleIds} from '../role-IDs';

const {admins, leadAdmin, leadAmbassador, leadDev} = roleIds;

module.exports = class FormatStatsCommand extends SlashCommand {
  millionStatsFormat: 'million_stats_format';

  allowedRoles = [      
    admins,
    leadAdmin,
    leadAmbassador,
    leadDev
  ];

  constructor(creator) {
    super(creator, {
      name: 'million_stats',
      description: 'Commands for million stats',
      guildIDs: [process.env.GUILD_ID],
      options: [
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'set_format',
          description: 'Set the million stat format.',
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'format',
              description: 'Use placeholders "{n}" for the stat name and "{c}" for stat count. Ex: {n} | {c}',
              required: true
            }
          ]
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          name: 'view_format',
          description: 'View the current million stat format.'
        },
      ]
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    const isValidUser = hasAllowedRoles(ctx, this.allowedRoles);

    if (!isValidUser) {
      const embed = createStatusEmbed(
        'Access Denied', 
        'You do not have permission to use this command',
        true
      );

      return ctx.send({embeds: [embed], ephemeral: true});
    }

    const {set_format, view_format} = ctx.options;
    if (typeof set_format !== 'undefined') {
      return this.setFormat(ctx);
    }

    if (typeof view_format !== 'undefined') {
      return this.viewFormat(ctx);
    }

    return ctx.send('Command Error', {ephemeral: true});
  }

  viewFormat = async (ctx: CommandContext): Promise<void> => {
    try {
      const format = await SettingsDataService.getMillionStatsFormat();

      if (typeof format !== 'string') throw 'invalid format';

      const message = 'Current Million Stats Format:\n' +
                      '```\n' +
                      `${format}\n` +
                      '```';

      ctx.send(message, {ephemeral: true});
    } catch (error) {
      console.log('"million_stats" Command Error: \n', error.message);
      const embed = createStatusEmbed(
        'Error viewing format', error.message || 'Something went wrong :(', 
        true
      );
      ctx.send({embeds:[embed] ,ephemeral: true});
    }
  }

  setFormat = async (ctx: CommandContext): Promise<void> => {
    const format = ctx.options?.set_format?.format;

    if (typeof format === 'undefined') throw 'Format is undefined';

    try {
      const record = await SettingsDataService.editSetting(
        'million_stats_format', 
        format
      );

      if (!record) throw 'Error editing format';

      const message = '```\n' +
                      `${record.fields?.value}\n` +
                      '```';
      const embed = createStatusEmbed('Format Set To:', message);

      ctx.send({embeds: [embed], ephemeral: true});
    } catch (error) {
      console.log('"million_stats" Command Error: \n', error.message);
      const embed = createStatusEmbed(
        'Error setting format', 
        error.message || 'Something went wrong :(', 
        true
      );
      ctx.send({embeds:[embed] ,ephemeral: true});
    }
  }
};
