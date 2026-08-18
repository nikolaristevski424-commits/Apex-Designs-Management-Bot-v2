const { SlashCommandBuilder } = require('discord.js');
const { getTicket, updateTicket } = require('../../utils/tickets');
const { getConfig } = require('../../utils/guildConfig');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'tickets', data: new SlashCommandBuilder().setName('invoice').setDescription('Send a payment invoice in this order ticket (staff only)').addStringOption(o => o.setName('amount').setDescription('Amount due, e.g. $45').setRequired(true)).addStringOption(o => o.setName('notes').setDescription('Extra notes').setRequired(false)),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const t = getTicket(i.guild.id, i.channel.id);
    if (!t) return i.reply({ embeds: [errorEmbed('Not a ticket channel.')], ephemeral: true });
    if (t.kind !== 'order') return i.reply({ embeds: [errorEmbed('Invoices only apply to design order tickets, not support tickets.')], ephemeral: true });
    const amount = i.options.getString('amount'); const notes = i.options.getString('notes');
    const cfg = getConfig(i.guild.id);
    updateTicket(i.guild.id, i.channel.id, { invoiceAmount: amount });
    const { embed, files } = brandedEmbed({ bannerKey: 'ticket', title: `Invoice — Order #${String(t.ticketNumber).padStart(4, '0')}`, description: `Hey <@${t.customerId}>, here's your invoice!`, fields: [{ name: 'Service', value: t.service, inline: true }, { name: 'Amount Due', value: amount, inline: true }, { name: 'Payment Info', value: cfg.paymentInfo || 'Ask staff for payment details.' }, ...(notes ? [{ name: 'Notes', value: notes }] : [])] });
    return i.reply({ embeds: [embed], files });
  }
};
