const { SlashCommandBuilder } = require('discord.js');
const { getAllTickets } = require('../../utils/tickets');
const { brandedEmbed } = require('../../utils/embeds');
const PRI = { low: '🟢', normal: '🔵', high: '🟠', urgent: '🔴' };
const KIND = { order: '📦', support: '🎫' };
module.exports = { category: 'tickets', data: new SlashCommandBuilder().setName('queue').setDescription('View the current ticket queue (orders + support)')
  .addStringOption(o => o.setName('filter').setDescription('Show only one kind').setRequired(false).addChoices({ name: 'Orders only', value: 'order' }, { name: 'Support only', value: 'support' })),
  async execute(i) {
    const filter = i.options.getString('filter');
    const all = Object.entries(getAllTickets(i.guild.id)).filter(([, t]) => t.status !== 'closed' && (!filter || t.kind === filter)).sort((a, b) => new Date(a[1].createdAt) - new Date(b[1].createdAt));
    if (!all.length) return i.reply({ embeds: [brandedEmbed({ title: 'Ticket Queue', description: 'Nothing open right now. 🎉' }).embed], ephemeral: true });
    const lines = all.map(([chId, t], idx) => `${idx + 1}. ${KIND[t.kind]}${PRI[t.priority] || PRI.normal} <#${chId}> — **${t.kind === 'order' ? t.service : t.typeLabel}** — ${t.claimedBy ? `<@${t.claimedBy}>` : '**unclaimed**'}`);
    const { embed, files } = brandedEmbed({ bannerKey: 'ticket', title: `Ticket Queue (${all.length} open)`, description: lines.join('\n').slice(0, 4000) });
    return i.reply({ embeds: [embed], files, ephemeral: true });
  }
};
