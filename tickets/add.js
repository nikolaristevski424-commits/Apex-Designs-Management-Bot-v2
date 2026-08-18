const { SlashCommandBuilder } = require('discord.js');
const { getTicket } = require('../../utils/tickets');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'tickets', data: new SlashCommandBuilder().setName('add').setDescription('Add a user to this ticket (staff only)').addUserOption(o => o.setName('user').setDescription('User to add').setRequired(true)),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    if (!getTicket(i.guild.id, i.channel.id)) return i.reply({ embeds: [errorEmbed('Not a ticket channel.')], ephemeral: true });
    const user = i.options.getUser('user');
    await i.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
    return i.reply({ embeds: [successEmbed(`${user} added to this ticket.`)] });
  }
};
