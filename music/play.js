const { SlashCommandBuilder } = require('discord.js');
const { LAVALINK_CONFIGURED, notConfiguredEmbed } = require('../../utils/music');
const { errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'music', data: new SlashCommandBuilder().setName('play').setDescription('Play a song (requires a configured Lavalink server)').addStringOption(o=>o.setName('song').setDescription('Song name or URL').setRequired(true)),
  async execute(i) {
    if (!LAVALINK_CONFIGURED) return i.reply({ embeds: [notConfiguredEmbed(errorEmbed)], ephemeral: true });
    return i.reply({ embeds: [errorEmbed('Music node connected but the play handler is not wired up yet.')], ephemeral: true });
  }
};
