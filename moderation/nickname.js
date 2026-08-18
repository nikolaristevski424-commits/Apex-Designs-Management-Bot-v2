const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'moderation', data: new SlashCommandBuilder().setName('nickname').setDescription("Change a member's nickname (staff only)").addUserOption(o=>o.setName('user').setDescription('User').setRequired(true)).addStringOption(o=>o.setName('nickname').setDescription('New nickname (leave blank to reset)').setRequired(false)),
  async execute(i) {
    if (!isStaff(i.member) || !i.member.permissions.has(PermissionFlagsBits.ManageNicknames)) return i.reply({ embeds: [errorEmbed('You need Manage Nicknames permission.')], ephemeral: true });
    const user = i.options.getUser('user'); const nick = i.options.getString('nickname') || null;
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });
    await member.setNickname(nick).catch(() => null);
    return i.reply({ embeds: [successEmbed(nick ? `Nickname set to **${nick}**.` : 'Nickname reset.')] });
  }
};
