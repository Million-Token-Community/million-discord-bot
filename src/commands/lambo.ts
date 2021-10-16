import { SlashCommand } from 'slash-create';
import * as Discord from 'discord.js';

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'lambo',
      description: 'When lambo? (as a millionaire).',
      guildIDs: [process.env.GUILD_ID],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx) {
      const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#00E676')//Green50 (A400)
           .addField('Here is your Lambo', '\u200B')
            .setImage('https://i.imgur.com/hw8rJeu.png')

        await ctx.send({embeds: [exampleEmbed], ephemeral: true});

  }


  

};
