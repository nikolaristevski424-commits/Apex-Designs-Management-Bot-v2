const { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getTicket, updateTicket } = require('../../utils/tickets');
const { getSlice, setSlice } = require('../../utils/storage');
const { getConfig } = require('../../utils/guildConfig');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, brandedEmbed } = require('../../utils/embeds');

async function buildTranscript(channel) {
  let msgs = []; let last;
  for (let i = 0; i < 10; i++) {
    const b = await channel.messages.fetch({ limit: 100, before: last });
    if (!b.size) break;
    msgs = msgs.concat([...b.values()]); last = b.last().id;
    if (b.size < 100) break;
  }
  msgs.reverse();
  return msgs.map(m => `[${m.createdAt.toISOString().slice(0, 19)}] ${m.author.tag}: ${m.content || '[embed/file]'}`).join('\n') || 'No messages.';
}

async function closeOrder(interaction, channel, ticket, reason) {
  const cfg = getConfig(interaction.guild.id);
  const txt = await buildTranscript(channel);
  const label = ticket.kind === 'order' ? 'Order' : 'Support';
  const att = new AttachmentBuilder(Buffer.from(txt, 'utf8'), { name: `transcript-${label.toLowerCase()}-${ticket.ticketNumber}.txt` });

  updateTicket(interaction.guild.id, channel.id, { status: 'closed', closedAt: new Date().toISOString(), closedReason: reason || 'None' });
  if (ticket.claimedBy) {
    const sd = getSlice('staff', interaction.guild.id, { stats: {} });
    if (!sd.stats[ticket.claimedBy]) sd.stats[ticket.claimedBy] = { claimed: 0, completed: 0 };
    sd.stats[ticket.claimedBy].completed++; setSlice('staff', interaction.guild.id, sd);
  }
  if (cfg.logChannelId) {
    const lc = interaction.guild.channels.cache.get(cfg.logChannelId);
    if (lc) lc.send({ embeds: [brandedEmbed({ title: `🔒 ${label} #${ticket.ticketNumber} Closed`, description: `Closed by ${interaction.user.tag}\nReason: ${reason || 'None'}`,
      fields: [{ name: 'Customer', value: `<@${ticket.customerId}>`, inline: true }, { name: label === 'Order' ? 'Service' : 'Type', value: ticket.kind === 'order' ? ticket.service : ticket.typeLabel, inline: true }, { name: 'Claimed by', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'Unclaimed', inline: true }] }).embed], files: [att] }).catch(() => {});
  }
  await channel.permissionOverwrites.edit(ticket.customerId, { SendMessages: false }).catch(() => {});
  await channel.setName(`closed-${channel.name}`.slice(0, 95)).catch(() => {});
  const delBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`ticket_delete_${channel.id}`).setLabel('Delete Channel').setStyle(ButtonStyle.Danger).setEmoji('🗑️'));
  await channel.send({ embeds: [brandedEmbed({ title: `${label} Closed`, description: `Closed by ${interaction.user}.\nReason: ${reason || 'None'}\n\nStaff can delete this channel below.` }).embed], components: [delBtn] });

  if (cfg.dmOnClose !== false) {
    const customer = await interaction.client.users.fetch(ticket.customerId).catch(() => null);
    if (customer) {
      const ratingMenu = new StringSelectMenuBuilder().setCustomId(`ticket_rate_${interaction.guild.id}_${channel.id}`).setPlaceholder('Rate your experience (optional)').addOptions([1, 2, 3, 4, 5].map(n => ({ label: '⭐'.repeat(n), value: String(n) })));
      await customer.send({ embeds: [brandedEmbed({ title: `Your ${label} Was Closed`, description: `Your ${label.toLowerCase()} **#${ticket.ticketNumber}** with Apex Designs has been closed.\nReason: ${reason || 'None'}\n\nMind rating your experience?` }).embed], components: [new ActionRowBuilder().addComponents(ratingMenu)] }).catch(() => {});
    }
  }
}

module.exports = { category: 'tickets', closeOrder, buildTranscript,
  data: new SlashCommandBuilder().setName('close').setDescription('Close this ticket (staff only)').addStringOption(o => o.setName('reason').setDescription('Reason for closing').setRequired(false)),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const t = getTicket(i.guild.id, i.channel.id);
    if (!t) return i.reply({ embeds: [errorEmbed('Not a ticket channel.')], ephemeral: true });
    if (t.status === 'closed') return i.reply({ embeds: [errorEmbed('Already closed.')], ephemeral: true });
    await i.reply({ embeds: [brandedEmbed({ description: '🔒 Closing and generating transcript…' }).embed] });
    return closeOrder(i, i.channel, t, i.options.getString('reason'));
  }
};
