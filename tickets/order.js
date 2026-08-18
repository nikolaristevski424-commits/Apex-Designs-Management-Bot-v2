const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getConfig, nextTicket } = require('../../utils/guildConfig');
const { saveTicket, countOpenForUser } = require('../../utils/tickets');
const { brandedEmbed, errorEmbed } = require('../../utils/embeds');

function modalFields(noService) {
  const fields = [];
  if (!noService) fields.push(new TextInputBuilder().setCustomId('order_service').setLabel('What do you need designed?').setPlaceholder('e.g. Logo, Banner, Branding Suite').setStyle(TextInputStyle.Short).setRequired(true));
  fields.push(
    new TextInputBuilder().setCustomId('order_details').setLabel('Describe your vision / requirements').setPlaceholder('Colors, style, references, text, etc.').setStyle(TextInputStyle.Paragraph).setRequired(true),
    new TextInputBuilder().setCustomId('order_budget').setLabel('Your budget').setPlaceholder('e.g. $25 or 500 Robux').setStyle(TextInputStyle.Short).setRequired(true),
    new TextInputBuilder().setCustomId('order_deadline').setLabel('Deadline / timeframe').setPlaceholder('e.g. No rush / 3 days / ASAP').setStyle(TextInputStyle.Short).setRequired(false),
  );
  return fields;
}

async function createOrderTicket(interaction, { service, details, budget, deadline }) {
  const config = getConfig(interaction.guild.id);
  const openCount = countOpenForUser(interaction.guild.id, interaction.user.id, 'order');
  const max = config.maxTicketsPerUser || 3;
  if (openCount >= max) return interaction.reply({ embeds: [errorEmbed(`You already have **${openCount}/${max}** open order tickets. Please wait for one to close first.`)], ephemeral: true });

  const num = nextTicket(interaction.guild.id);
  const chName = `order-${String(num).padStart(4, '0')}-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);
  const ow = [
    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
    { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] },
  ];
  if (config.staffRoleId) ow.push({ id: config.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });

  let channel;
  try {
    channel = await interaction.guild.channels.create({ name: chName, type: ChannelType.GuildText, parent: config.ticketCategoryId, topic: `Order #${num} | ${interaction.user.tag} | Open`, permissionOverwrites: ow });
  } catch (e) {
    console.error('create order channel failed:', e);
    return interaction.reply({ embeds: [errorEmbed('Could not create your ticket channel. Check that I have Manage Channels permission and the ticket category exists.')], ephemeral: true });
  }

  saveTicket(interaction.guild.id, channel.id, { kind: 'order', ticketNumber: num, customerId: interaction.user.id, service, details, budget, deadline, status: 'open', priority: 'normal', claimedBy: null, createdAt: new Date().toISOString() });

  const { embed, files } = brandedEmbed({ bannerKey: 'ticket', title: `Order #${String(num).padStart(4, '0')}`, description: `Thanks for ordering with **Apex Designs**, ${interaction.user}! A designer will be with you shortly.`,
    fields: [{ name: 'Service', value: service, inline: true }, { name: 'Budget', value: budget, inline: true }, { name: 'Deadline', value: deadline, inline: true }, { name: 'Details', value: details.slice(0, 1000) }] });
  const btns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_claim_${channel.id}`).setLabel('Claim Order').setStyle(ButtonStyle.Success).setEmoji('🎯'),
    new ButtonBuilder().setCustomId(`ticket_close_${channel.id}`).setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'));

  await channel.send({ content: config.staffRoleId ? `<@&${config.staffRoleId}> new order from ${interaction.user}` : `${interaction.user}`, embeds: [embed], files, components: [btns] });
  await interaction.reply({ embeds: [brandedEmbed({ description: `✅ Ticket created: ${channel}` }).embed], ephemeral: true });

  if (config.logChannelId) {
    const lc = interaction.guild.channels.cache.get(config.logChannelId);
    if (lc) lc.send({ embeds: [brandedEmbed({ title: `📋 New Order #${num}`, description: `${interaction.user.tag} opened ${channel}`, fields: [{ name: 'Service', value: service, inline: true }, { name: 'Budget', value: budget, inline: true }] }).embed] }).catch(() => {});
  }
  return channel;
}

module.exports = {
  category: 'tickets', createOrderTicket,
  data: new SlashCommandBuilder().setName('order').setDescription('Start a new custom design order with Apex Designs'),
  async execute(i) {
    const cfg = getConfig(i.guild.id);
    if (!cfg.configured || !cfg.ticketCategoryId) return i.reply({ embeds: [errorEmbed('Run `/setup` first.')], ephemeral: true });
    const modal = new ModalBuilder().setCustomId('order_modal').setTitle('New Apex Designs Order');
    modal.addComponents(modalFields(false).map(f => new ActionRowBuilder().addComponents(f)));
    return i.showModal(modal);
  },
  async handleModalSubmit(i) {
    await createOrderTicket(i, { service: i.fields.getTextInputValue('order_service'), details: i.fields.getTextInputValue('order_details'), budget: i.fields.getTextInputValue('order_budget'), deadline: i.fields.getTextInputValue('order_deadline') || 'Not specified' });
  },
  buildPanelModal(service) {
    const modal = new ModalBuilder().setCustomId(`order_modal_panel__${encodeURIComponent(service)}`).setTitle(`Order — ${service}`.slice(0, 45));
    modal.addComponents(modalFields(true).map(f => new ActionRowBuilder().addComponents(f)));
    return modal;
  },
  async handlePanelModalSubmit(i, service) {
    await createOrderTicket(i, { service, details: i.fields.getTextInputValue('order_details'), budget: i.fields.getTextInputValue('order_budget'), deadline: i.fields.getTextInputValue('order_deadline') || 'Not specified' });
  },
};
