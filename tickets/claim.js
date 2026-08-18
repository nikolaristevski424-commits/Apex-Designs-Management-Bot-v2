const { SlashCommandBuilder } = require('discord.js');
const { getTicket, updateTicket } = require('../../utils/tickets');
const { getSlice, setSlice } = require('../../utils/storage');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
async function claimOrder(gId, chId, staffId) {
  const t = updateTicket(gId, chId, { status: 'claimed', claimedBy: staffId });
  if (!t) return null;
  const sd = getSlice('staff', gId, { staffIds: [], stats: {} });
  if (!sd.stats[staffId]) sd.stats[staffId] = { claimed: 0, completed: 0 };
  sd.stats[staffId].claimed++; setSlice('staff', gId, sd);
  return t;
}
module.exports = { category: 'tickets', claimOrder, data: new SlashCommandBuilder().setName('claim').setDescription('Claim the ticket in this channel (staff only)'),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const t = getTicket(i.guild.id, i.channel.id);
    if (!t) return i.reply({ embeds: [errorEmbed('Not a ticket channel.')], ephemeral: true });
    if (t.claimedBy) return i.reply({ embeds: [errorEmbed(`Already claimed by <@${t.claimedBy}>.`)], ephemeral: true });
    await claimOrder(i.guild.id, i.channel.id, i.user.id);
    const label = t.kind === 'order' ? `Order #${t.ticketNumber}` : `Support #${t.ticketNumber}`;
    await i.channel.setTopic(`${label} | Claimed by: ${i.user.tag}`).catch(() => {});
    return i.reply({ embeds: [successEmbed(`Claimed by ${i.user}!`)] });
  }
};
