const { SlashCommandBuilder } = require('discord.js');
const { getTicket, updateTicket } = require('../../utils/tickets');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'tickets', data: new SlashCommandBuilder().setName('reopen').setDescription('Reopen a closed ticket (staff only)'),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const t = getTicket(i.guild.id, i.channel.id);
    if (!t) return i.reply({ embeds: [errorEmbed('Not a ticket channel.')], ephemeral: true });
    if (t.status !== 'closed') return i.reply({ embeds: [errorEmbed('This ticket is not closed.')], ephemeral: true });
    updateTicket(i.guild.id, i.channel.id, { status: t.claimedBy ? 'claimed' : 'open', closedAt: undefined, closedReason: undefined });
    await i.channel.permissionOverwrites.edit(t.customerId, { SendMessages: true }).catch(() => {});
    if (i.channel.name.startsWith('closed-')) await i.channel.setName(i.channel.name.replace('closed-', '')).catch(() => {});
    const { embed, files } = brandedEmbed({ bannerKey: 'ticket', title: 'Ticket Reopened', description: `Reopened by ${i.user}. <@${t.customerId}>, you can send messages again.` });
    return i.reply({ embeds: [embed], files });
  }
};
