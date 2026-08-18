const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getConfig, nextSupportTicket } = require('../../utils/guildConfig');
const { saveTicket, countOpenForUser } = require('../../utils/tickets');
const { brandedEmbed, errorEmbed } = require('../../utils/embeds');

const SUPPORT_TYPES = [
  { label: 'General Support', value: 'general', emoji: '💬', description: 'Questions about our services' },
  { label: 'Payment Help', value: 'payment', emoji: '💳', description: 'Issues with a payment or invoice' },
  { label: 'Report an Issue', value: 'report', emoji: '🚩', description: 'Report a bug, bad experience, or user' },
  { label: 'Partnership Inquiry', value: 'partnership', emoji: '🤝', description: 'Business or collab inquiries' },
  { label: 'Other', value: 'other', emoji: '❓', description: "Anything that doesn't fit above" },
];

function typeSelectRow() {
  const menu = new StringSelectMenuBuilder().setCustomId('support_type_select').setPlaceholder('Select a support ticket type…')
    .addOptions(SUPPORT_TYPES.map(t => ({ label: t.label, value: t.value, emoji: t.emoji, description: t.description })));
  return new ActionRowBuilder().addComponents(menu);
}

function buildReasonModal(typeValue) {
  const typeLabel = SUPPORT_TYPES.find(t => t.value === typeValue)?.label || 'Support';
  const modal = new ModalBuilder().setCustomId(`support_modal__${typeValue}`).setTitle(`${typeLabel}`.slice(0, 45));
  modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('support_reason').setLabel('How can we help?').setPlaceholder('Describe your question or issue in detail...').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)));
  return modal;
}

async function createSupportTicket(interaction, { type, reason }) {
  const config = getConfig(interaction.guild.id);
  const openCount = countOpenForUser(interaction.guild.id, interaction.user.id, 'support');
  const max = config.maxTicketsPerUser || 3;
  if (openCount >= max) return interaction.reply({ embeds: [errorEmbed(`You already have **${openCount}/${max}** open support tickets. Please wait for one to close first.`)], ephemeral: true });

  const num = nextSupportTicket(interaction.guild.id);
  const typeLabel = SUPPORT_TYPES.find(t => t.value === type)?.label || 'Support';
  const chName = `support-${String(num).padStart(4, '0')}-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);
  const categoryId = config.supportCategoryId || config.ticketCategoryId;
  if (!categoryId) return interaction.reply({ embeds: [errorEmbed('Support tickets are not set up yet. Ask an admin to run `/setup`.')], ephemeral: true });

  const ow = [
    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
    { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] },
  ];
  if (config.staffRoleId) ow.push({ id: config.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });

  let channel;
  try {
    channel = await interaction.guild.channels.create({ name: chName, type: ChannelType.GuildText, parent: categoryId, topic: `Support #${num} | ${typeLabel} | ${interaction.user.tag} | Open`, permissionOverwrites: ow });
  } catch (e) {
    console.error('create support channel failed:', e);
    return interaction.reply({ embeds: [errorEmbed('Could not create your ticket channel. Check that I have Manage Channels permission and the support category exists.')], ephemeral: true });
  }

  saveTicket(interaction.guild.id, channel.id, { kind: 'support', ticketNumber: num, type, typeLabel, customerId: interaction.user.id, reason, status: 'open', priority: 'normal', claimedBy: null, createdAt: new Date().toISOString() });

  const { embed, files } = brandedEmbed({ bannerKey: 'ticket', title: `Support #${String(num).padStart(4, '0')} — ${typeLabel}`, description: `Thanks for reaching out, ${interaction.user}! A staff member will be with you shortly.`, fields: [{ name: 'Details', value: reason.slice(0, 1000) }] });
  const btns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_claim_${channel.id}`).setLabel('Claim').setStyle(ButtonStyle.Success).setEmoji('🎯'),
    new ButtonBuilder().setCustomId(`ticket_close_${channel.id}`).setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'));

  await channel.send({ content: config.staffRoleId ? `<@&${config.staffRoleId}> new support ticket from ${interaction.user}` : `${interaction.user}`, embeds: [embed], files, components: [btns] });
  await interaction.reply({ embeds: [brandedEmbed({ description: `✅ Support ticket created: ${channel}` }).embed], ephemeral: true });

  if (config.logChannelId) {
    const lc = interaction.guild.channels.cache.get(config.logChannelId);
    if (lc) lc.send({ embeds: [brandedEmbed({ title: `🎫 New Support Ticket #${num}`, description: `${interaction.user.tag} opened ${channel} (${typeLabel})` }).embed] }).catch(() => {});
  }
  return channel;
}

module.exports = {
  category: 'tickets', createSupportTicket, buildReasonModal, typeSelectRow, SUPPORT_TYPES,
  data: new SlashCommandBuilder().setName('support').setDescription('Open a general support ticket (not a design order)'),
  async execute(i) {
    const cfg = getConfig(i.guild.id);
    if (!cfg.configured) return i.reply({ embeds: [errorEmbed('Run `/setup` first.')], ephemeral: true });
    const { embed, files } = brandedEmbed({ bannerKey: 'ticket', title: 'Open a Support Ticket', description: 'Pick a category below to get started.' });
    return i.reply({ embeds: [embed], files, components: [typeSelectRow()], ephemeral: true });
  },
  async handleModalSubmit(i, type) { await createSupportTicket(i, { type, reason: i.fields.getTextInputValue('support_reason') }); },
};
