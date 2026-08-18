const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'moderation', data: new SlashCommandBuilder().setName('lock').setDescription('Lock this channel so @everyone cannot send messages (staff only)'),
  async execute(i) {
    if (!isStaff(i.member) || !i.member.permissions.has(PermissionFlagsBits.ManageChannels)) return i.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
    await i.channel.permissionOverwrites.edit(i.guild.roles.everyone, { SendMessages: false });
    return i.reply({ embeds: [successEmbed('🔒 Channel locked.')] });
  }
};
