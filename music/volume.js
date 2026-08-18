const { SlashCommandBuilder } = require('discord.js');
const { LAVALINK_CONFIGURED, notConfiguredEmbed } = require('../../utils/music');
const { errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'music', data: new SlashCommandBuilder().setName('volume').setDescription('Set playback volume (requires a configured Lavalink server)').addIntegerOption(o=>o.setName('level').setDescription('Volume 0-100').setMinValue(0).setMaxValue(100).setRequired(true)),
  async execute(i) { if (!LAVALINK_CONFIGURED) return i.reply({ embeds: [notConfiguredEmbed(errorEmbed)], ephemeral: true }); return i.reply({ embeds: [errorEmbed('Music node connected but the volume handler is not wired up yet.')], ephemeral: true }); }
};
