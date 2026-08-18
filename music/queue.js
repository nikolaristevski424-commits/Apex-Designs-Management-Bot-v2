const { SlashCommandBuilder } = require('discord.js');
const { LAVALINK_CONFIGURED, notConfiguredEmbed } = require('../../utils/music');
const { errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'music', data: new SlashCommandBuilder().setName('musicqueue').setDescription('View the music queue (requires a configured Lavalink server)'),
  async execute(i) { if (!LAVALINK_CONFIGURED) return i.reply({ embeds: [notConfiguredEmbed(errorEmbed)], ephemeral: true }); return i.reply({ embeds: [errorEmbed('Music node connected but the queue handler is not wired up yet.')], ephemeral: true }); }
};
