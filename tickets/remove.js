const { SlashCommandBuilder } = require('discord.js');
const { getTicket } = require('../../utils/tickets');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'tickets', data: new SlashCommandBuilder().setName('remove').setDescription('Remove a user from this ticket (staff only)').addUserOption(o => o.setName('user').setDescription('User to remove').setRequired(true)),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const t = getTicket(i.guild.id, i.channel.id);
    if (!t) return i.reply({ embeds: [errorEmbed('Not a ticket channel.')], ephemeral: true });
    const user = i.options.getUser('user');
    if (user.id === t.customerId) return i.reply({ embeds: [errorEmbed('Cannot remove the ticket owner.')], ephemeral: true });
    await i.channel.permissionOverwrites.delete(user.id).catch(() => {});
    return i.reply({ embeds: [successEmbed(`${user} removed.`)] });
  }
};
