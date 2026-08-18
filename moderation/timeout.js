const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getConfig } = require('../../utils/guildConfig');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'moderation', data: new SlashCommandBuilder().setName('timeout').setDescription('Timeout a member (staff only)').addUserOption(o=>o.setName('user').setDescription('User to timeout').setRequired(true)).addIntegerOption(o=>o.setName('minutes').setDescription('Duration in minutes (0 to remove timeout)').setRequired(true).setMinValue(0).setMaxValue(40320)).addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(false)),
  async execute(i) {
    if (!isStaff(i.member) || !i.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return i.reply({ embeds: [errorEmbed('You need Timeout Members permission.')], ephemeral: true });
    const user = i.options.getUser('user'); const minutes = i.options.getInteger('minutes'); const reason = i.options.getString('reason') || 'No reason provided';
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ embeds: [errorEmbed('User not found in this server.')], ephemeral: true });
    if (!member.moderatable) return i.reply({ embeds: [errorEmbed("I can't timeout this user (role hierarchy).")], ephemeral: true });
    await member.timeout(minutes === 0 ? null : minutes * 60 * 1000, reason);
    const { embed, files } = brandedEmbed({ title: minutes === 0 ? '⏱️ Timeout Removed' : '⏱️ Member Timed Out', fields: [{ name: 'User', value: `${user.tag}`, inline: true }, ...(minutes > 0 ? [{ name: 'Duration', value: `${minutes} min`, inline: true }] : []), { name: 'Reason', value: reason }] });
    await i.reply({ embeds: [embed], files });
    const cfg = getConfig(i.guild.id);
    if (cfg.modLogChannelId) i.guild.channels.cache.get(cfg.modLogChannelId)?.send({ embeds: [embed], files }).catch(() => {});
  }
};
