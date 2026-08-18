const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getConfig } = require('../../utils/guildConfig');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'moderation', data: new SlashCommandBuilder().setName('kick').setDescription('Kick a member (staff only)').addUserOption(o=>o.setName('user').setDescription('User to kick').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(false)),
  async execute(i) {
    if (!isStaff(i.member) || !i.member.permissions.has(PermissionFlagsBits.KickMembers)) return i.reply({ embeds: [errorEmbed('You need Kick Members permission.')], ephemeral: true });
    const user = i.options.getUser('user'); const reason = i.options.getString('reason') || 'No reason provided';
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ embeds: [errorEmbed('User not found in this server.')], ephemeral: true });
    if (!member.kickable) return i.reply({ embeds: [errorEmbed("I can't kick this user (role hierarchy).")], ephemeral: true });
    await user.send({ embeds: [brandedEmbed({ title: `You were kicked from ${i.guild.name}`, description: reason }).embed] }).catch(() => {});
    await member.kick(reason);
    const { embed, files } = brandedEmbed({ title: '👢 Member Kicked', fields: [{ name: 'User', value: `${user.tag}`, inline: true }, { name: 'Reason', value: reason }] });
    await i.reply({ embeds: [embed], files });
    const cfg = getConfig(i.guild.id);
    if (cfg.modLogChannelId) i.guild.channels.cache.get(cfg.modLogChannelId)?.send({ embeds: [embed], files }).catch(() => {});
  }
};
