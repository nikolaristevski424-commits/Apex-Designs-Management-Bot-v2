const { SlashCommandBuilder } = require('discord.js');
const { getTicket, updateTicket } = require('../../utils/tickets');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const LABELS = { low: '🟢 Low', normal: '🔵 Normal', high: '🟠 High', urgent: '🔴 Urgent' };
module.exports = { category: 'tickets', data: new SlashCommandBuilder().setName('priority').setDescription('Set ticket priority (staff only)').addStringOption(o => o.setName('level').setDescription('Priority level').setRequired(true).addChoices({ name: 'Low', value: 'low' }, { name: 'Normal', value: 'normal' }, { name: 'High', value: 'high' }, { name: 'Urgent', value: 'urgent' })),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const t = getTicket(i.guild.id, i.channel.id);
    if (!t) return i.reply({ embeds: [errorEmbed('Not a ticket channel.')], ephemeral: true });
    const lvl = i.options.getString('level');
    updateTicket(i.guild.id, i.channel.id, { priority: lvl });
    return i.reply({ embeds: [successEmbed(`Priority set to ${LABELS[lvl]}.`)] });
  }
};
