const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getConfig } = require('../../utils/guildConfig');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'moderation', data: new SlashCommandBuilder().setName('ban').setDescription('Ban a member (staff only)').addUserOption(o=>o.setName('user').setDescription('User to ban').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(false)).addIntegerOption(o=>o.setName('delete_days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false)),
  async execute(i) {
    if (!isStaff(i.member) || !i.member.permissions.has(PermissionFlagsBits.BanMembers)) return i.reply({ embeds: [errorEmbed('You need Ban Members permission.')], ephemeral: true });
    const user = i.options.getUser('user'); const reason = i.options.getString('reason') || 'No reason provided'; const days = i.options.getInteger('delete_days') || 0;
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (member && !member.bannable) return i.reply({ embeds: [errorEmbed("I can't ban this user (role hierarchy).")], ephemeral: true });
    await user.send({ embeds: [brandedEmbed({ title: `You were banned from ${i.guild.name}`, description: reason }).embed] }).catch(() => {});
    await i.guild.members.ban(user.id, { reason, deleteMessageSeconds: days * 86400 });
    const { embed, files } = brandedEmbed({ title: '🔨 Member Banned', fields: [{ name: 'User', value: `${user.tag}`, inline: true }, { name: 'Reason', value: reason }] });
    await i.reply({ embeds: [embed], files });
    const cfg = getConfig(i.guild.id);
    if (cfg.modLogChannelId) i.guild.channels.cache.get(cfg.modLogChannelId)?.send({ embeds: [embed], files }).catch(() => {});
  }
};
