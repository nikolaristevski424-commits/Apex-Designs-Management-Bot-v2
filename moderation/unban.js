const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'moderation', data: new SlashCommandBuilder().setName('unban').setDescription('Unban a user by ID (staff only)').addStringOption(o=>o.setName('user_id').setDescription('User ID to unban').setRequired(true)),
  async execute(i) {
    if (!isStaff(i.member) || !i.member.permissions.has(PermissionFlagsBits.BanMembers)) return i.reply({ embeds: [errorEmbed('You need Ban Members permission.')], ephemeral: true });
    const userId = i.options.getString('user_id').trim();
    try { await i.guild.members.unban(userId); return i.reply({ embeds: [successEmbed(`Unbanned <@${userId}>.`)] }); }
    catch { return i.reply({ embeds: [errorEmbed('Could not unban — check the user ID is correct and they are actually banned.')], ephemeral: true }); }
  }
};
