const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'moderation', data: new SlashCommandBuilder().setName('slowmode').setDescription('Set slowmode for this channel (staff only)').addIntegerOption(o=>o.setName('seconds').setDescription('Seconds between messages (0 to disable)').setRequired(true).setMinValue(0).setMaxValue(21600)),
  async execute(i) {
    if (!isStaff(i.member) || !i.member.permissions.has(PermissionFlagsBits.ManageChannels)) return i.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
    const seconds = i.options.getInteger('seconds');
    await i.channel.setRateLimitPerUser(seconds);
    return i.reply({ embeds: [successEmbed(seconds === 0 ? 'Slowmode disabled.' : `Slowmode set to ${seconds}s.`)] });
  }
};
