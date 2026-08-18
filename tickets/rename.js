const { SlashCommandBuilder } = require('discord.js');
const { getTicket } = require('../../utils/tickets');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'tickets', data: new SlashCommandBuilder().setName('rename').setDescription('Rename this ticket channel (staff only)').addStringOption(o => o.setName('name').setDescription('New channel name').setRequired(true)),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    if (!getTicket(i.guild.id, i.channel.id)) return i.reply({ embeds: [errorEmbed('Not a ticket channel.')], ephemeral: true });
    const name = i.options.getString('name').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 95);
    await i.channel.setName(name);
    return i.reply({ embeds: [successEmbed(`Renamed to **${name}**.`)] });
  }
};
