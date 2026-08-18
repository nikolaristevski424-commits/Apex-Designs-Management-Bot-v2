const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'moderation', data: new SlashCommandBuilder().setName('removerole').setDescription('Remove a role from a member (staff only)').addUserOption(o=>o.setName('user').setDescription('User').setRequired(true)).addRoleOption(o=>o.setName('role').setDescription('Role to remove').setRequired(true)),
  async execute(i) {
    if (!isStaff(i.member) || !i.member.permissions.has(PermissionFlagsBits.ManageRoles)) return i.reply({ embeds: [errorEmbed('You need Manage Roles permission.')], ephemeral: true });
    const user = i.options.getUser('user'); const role = i.options.getRole('role');
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });
    await member.roles.remove(role).catch(() => null);
    return i.reply({ embeds: [successEmbed(`Removed ${role} from ${user}.`)] });
  }
};
