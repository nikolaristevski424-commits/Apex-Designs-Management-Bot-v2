const {
  SlashCommandBuilder, MessageFlags, ContainerBuilder, SectionBuilder, TextDisplayBuilder,
  SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, AttachmentBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder,
} = require('discord.js');
const path = require('path');
const { isStaff, isManager } = require('../../utils/permissions');
const { getConfig } = require('../../utils/guildConfig');
const { getPrices } = require('../../utils/prices');
const { getSlice } = require('../../utils/storage');
const { getAllTickets } = require('../../utils/tickets');
const { errorEmbed } = require('../../utils/embeds');
const { SUPPORT_TYPES } = require('../tickets/support');

const BANNER_DIR = path.join(__dirname, '..', '..', 'banners');
function bannerFile(name) { return new AttachmentBuilder(path.join(BANNER_DIR, name), { name }); }
function bannerGallery(filename) { return new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(`attachment://${filename}`)); }
function sep(divider = true, size = SeparatorSpacingSize.Small) { return new SeparatorBuilder().setDivider(divider).setSpacing(size); }

function buildDashboardPanel(guild, config) {
  const container = new ContainerBuilder().setAccentColor(0xd81c2a)
    .addMediaGalleryComponents(bannerGallery('dashboard_panel_banner.png'))
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Apex Designs** delivers professional custom design services — logos, banners, branding suites, and more. We follow a structured process focused on quality, clear timelines, and communication.\n\nAll orders, pricing, and team info are organized here for easy reference.`))
    .addSeparatorComponents(sep(false, SeparatorSpacingSize.Large))
    .addSectionComponents(new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('### 📋 Guidelines & Rules'), new TextDisplayBuilder().setContent('Make sure to read our server guidelines before placing an order.'))
      .setSecondaryButtonAccessory(new ButtonBuilder().setCustomId('panel_guidelines').setLabel('View Guidelines').setStyle(ButtonStyle.Secondary)))
    .addSeparatorComponents(sep())
    .addMediaGalleryComponents(bannerGallery('divider_bar.png'))
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('panel_help').setLabel('Help').setStyle(ButtonStyle.Danger).setEmoji('❓'),
      new ButtonBuilder().setCustomId('panel_applications').setLabel('Applications').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
      new ButtonBuilder().setCustomId('panel_order_nav').setLabel('Place an Order').setStyle(ButtonStyle.Primary).setEmoji('🛒'),
      new ButtonBuilder().setCustomId('panel_tickets_nav').setLabel('Get Support').setStyle(ButtonStyle.Secondary).setEmoji('🎫')));
  return { components: [container], files: [bannerFile('dashboard_panel_banner.png'), bannerFile('divider_bar.png')], flags: MessageFlags.IsComponentsV2 };
}

function buildOrderPanel(guild, config) {
  const prices = getPrices(guild.id);
  const serviceSelect = new StringSelectMenuBuilder().setCustomId('panel_order_select').setPlaceholder('Order Here — Select a service to begin...')
    .addOptions(Object.keys(prices).slice(0, 25).map(s => ({ label: s, description: `$${prices[s]}`, value: s })));
  const container = new ContainerBuilder().setAccentColor(0xd81c2a)
    .addMediaGalleryComponents(bannerGallery('orderpanel_banner.png'))
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## Order Panel'), new TextDisplayBuilder().setContent('Welcome to the **Apex Designs Order Panel**. Here you can request custom design services — logos, banners, branding suites, and more.\n\nSelect a service from the dropdown below to get started. Make sure to read our **Terms of Service** before proceeding.'))
    .addSeparatorComponents(sep(false, SeparatorSpacingSize.Large))
    .addActionRowComponents(new ActionRowBuilder().addComponents(serviceSelect))
    .addSeparatorComponents(sep())
    .addMediaGalleryComponents(bannerGallery('divider_bar.png'))
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('panel_order_status').setLabel('Order Status').setStyle(ButtonStyle.Secondary).setEmoji('ℹ️'),
      new ButtonBuilder().setCustomId('panel_pricelist_nav').setLabel('Pricing').setStyle(ButtonStyle.Secondary).setEmoji('🏷️'),
      ...(config.tosUrl ? [new ButtonBuilder().setLabel('Terms of Service').setStyle(ButtonStyle.Link).setURL(config.tosUrl).setEmoji('📄')] : [new ButtonBuilder().setCustomId('panel_tos').setLabel('Terms of Service').setStyle(ButtonStyle.Secondary).setEmoji('📄')])));
  return { components: [container], files: [bannerFile('orderpanel_banner.png'), bannerFile('divider_bar.png')], flags: MessageFlags.IsComponentsV2 };
}

function buildTicketPanel(guild, config) {
  const typeSelect = new StringSelectMenuBuilder().setCustomId('support_type_select').setPlaceholder('Open a Ticket — Select a category...')
    .addOptions(SUPPORT_TYPES.map(t => ({ label: t.label, value: t.value, emoji: t.emoji, description: t.description })));
  const container = new ContainerBuilder().setAccentColor(0xd81c2a)
    .addMediaGalleryComponents(bannerGallery('ticket_banner.png'))
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## Support Tickets'), new TextDisplayBuilder().setContent("Need help with something that isn't a design order? Pick a category below and we'll open a private ticket with you."))
    .addSeparatorComponents(sep(false, SeparatorSpacingSize.Large))
    .addActionRowComponents(new ActionRowBuilder().addComponents(typeSelect))
    .addSeparatorComponents(sep())
    .addMediaGalleryComponents(bannerGallery('divider_bar.png'))
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('panel_order_nav').setLabel('Place a Design Order Instead').setStyle(ButtonStyle.Secondary).setEmoji('🛒'),
      new ButtonBuilder().setCustomId('panel_faq').setLabel('FAQ').setStyle(ButtonStyle.Secondary).setEmoji('❓')));
  return { components: [container], files: [bannerFile('ticket_banner.png'), bannerFile('divider_bar.png')], flags: MessageFlags.IsComponentsV2 };
}

function buildPricePanel(guild) {
  const prices = getPrices(guild.id);
  const lines = Object.entries(prices).map(([s, p]) => `> **${s}** — \`$${p}\``).join('\n');
  const container = new ContainerBuilder().setAccentColor(0xd81c2a)
    .addMediaGalleryComponents(bannerGallery('pricelist_banner.png'))
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## Apex Designs — Price List'), new TextDisplayBuilder().setContent(lines || 'No prices configured yet.'))
    .addSeparatorComponents(sep(false, SeparatorSpacingSize.Large))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('-# Prices are starting rates. Final cost confirmed by your assigned designer. Add-ons (rush delivery, extra revisions, source files) available at order time.'))
    .addSeparatorComponents(sep())
    .addMediaGalleryComponents(bannerGallery('divider_bar.png'))
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('panel_order_nav').setLabel('Place an Order').setStyle(ButtonStyle.Primary).setEmoji('🛒'),
      new ButtonBuilder().setCustomId('panel_quote_nav').setLabel('Build a Quote').setStyle(ButtonStyle.Secondary).setEmoji('🧮')));
  return { components: [container], files: [bannerFile('pricelist_banner.png'), bannerFile('divider_bar.png')], flags: MessageFlags.IsComponentsV2 };
}

function buildVouchesPanel(guild) {
  const vouches = getSlice('vouches', guild.id, {});
  const ranked = Object.entries(vouches).map(([id, d]) => ({ id, count: d.count, avg: d.count ? d.totalRating / d.count : 0, entries: d.entries || [] })).sort((a, b) => b.count - a.count).slice(0, 5);
  const container = new ContainerBuilder().setAccentColor(0xd81c2a);
  container.addMediaGalleryComponents(bannerGallery('vouch_banner.png'));
  container.addSeparatorComponents(sep());
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## What Our Clients Are Saying'));
  container.addSeparatorComponents(sep());
  if (!ranked.length) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent('No vouches yet — be the first to order and leave a review!'));
  } else {
    ranked.forEach((r, i) => {
      const latest = r.entries[0]; if (!latest) return;
      const stars = '⭐'.repeat(latest.rating) + '☆'.repeat(5 - latest.rating);
      container.addSectionComponents(new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${stars}  <@${r.id}>`), new TextDisplayBuilder().setContent(`*"${latest.comment}"*\n-# — <@${latest.from}> • ${r.count} vouch${r.count === 1 ? '' : 'es'} • ⭐ ${r.avg.toFixed(1)}/5`))
        .setSecondaryButtonAccessory(new ButtonBuilder().setCustomId(`panel_vouch_view_${r.id}`).setLabel('View All').setStyle(ButtonStyle.Secondary)));
      if (i < ranked.length - 1) container.addSeparatorComponents(sep(true));
    });
  }
  container.addSeparatorComponents(sep());
  container.addMediaGalleryComponents(bannerGallery('divider_bar.png'));
  container.addSeparatorComponents(sep());
  container.addActionRowComponents(new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('panel_order_nav').setLabel('Place an Order').setStyle(ButtonStyle.Primary).setEmoji('🛒')));
  return { components: [container], files: [bannerFile('vouch_banner.png'), bannerFile('divider_bar.png')], flags: MessageFlags.IsComponentsV2 };
}

function buildPortfolioPanel(guild) {
  const items = getSlice('portfolio', guild.id, []);
  const container = new ContainerBuilder().setAccentColor(0xd81c2a);
  container.addMediaGalleryComponents(bannerGallery('portfolio_banner.png'));
  container.addSeparatorComponents(sep());
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## Apex Designs — Portfolio'), new TextDisplayBuilder().setContent('A selection of our recent work. Every piece is crafted to stand above the rest.'));
  container.addSeparatorComponents(sep());
  if (!items.length) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent('No portfolio items yet. Staff: use `/addportfolio` to showcase your work.'));
  } else {
    container.addMediaGalleryComponents(new MediaGalleryBuilder().addItems(...items.slice(0, 10).map(item => new MediaGalleryItemBuilder().setURL(item.url).setDescription(item.caption || 'Apex Designs'))));
    if (items.length > 10) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Showing 10 of ${items.length} pieces. Use \`/portfolio\` to browse all.`));
  }
  container.addSeparatorComponents(sep());
  container.addMediaGalleryComponents(bannerGallery('divider_bar.png'));
  container.addSeparatorComponents(sep());
  container.addActionRowComponents(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('panel_order_nav').setLabel('Order Now').setStyle(ButtonStyle.Primary).setEmoji('🛒'),
    new ButtonBuilder().setCustomId('panel_vouches_nav').setLabel('See Reviews').setStyle(ButtonStyle.Secondary).setEmoji('⭐')));
  return { components: [container], files: [bannerFile('portfolio_banner.png'), bannerFile('divider_bar.png')], flags: MessageFlags.IsComponentsV2 };
}

function buildStaffPanel(guild) {
  const tickets = Object.values(getAllTickets(guild.id));
  const vouches = getSlice('vouches', guild.id, {});
  const orders = tickets.filter(t => t.kind === 'order'); const support = tickets.filter(t => t.kind === 'support');
  const open = tickets.filter(t => t.status === 'open').length; const claimed = tickets.filter(t => t.status === 'claimed').length; const closed = tickets.filter(t => t.status === 'closed').length;
  let topId = null; let topAvg = 0;
  Object.entries(vouches).forEach(([id, d]) => { if (d.count < 1) return; const a = d.totalRating / d.count; if (a > topAvg) { topAvg = a; topId = id; } });
  const openList = tickets.filter(t => t.status !== 'closed').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(0, 8)
    .map(t => { const emoji = { low: '🟢', normal: '🔵', high: '🟠', urgent: '🔴' }[t.priority] || '🔵'; const kindIcon = t.kind === 'order' ? '📦' : '🎫'; const label = t.kind === 'order' ? t.service : t.typeLabel; return `${kindIcon}${emoji} **${label}** — ${t.claimedBy ? `<@${t.claimedBy}>` : '**unclaimed**'} — <@${t.customerId}>`; }).join('\n') || 'No open tickets right now. 🎉';
  const container = new ContainerBuilder().setAccentColor(0xd81c2a)
    .addMediaGalleryComponents(bannerGallery('staff_banner.png'))
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## Staff Operations Dashboard'))
    .addSeparatorComponents(sep())
    .addSectionComponents(new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('### 📊 Queue Summary'), new TextDisplayBuilder().setContent(`🟢 Open: **${open}** · 🔵 Active: **${claimed}** · ✅ Done (all-time): **${closed}**\n📦 Orders: **${orders.length}** · 🎫 Support: **${support.length}**\n🏆 Top designer: ${topId ? `<@${topId}> (⭐${topAvg.toFixed(1)})` : 'No data yet'}`))
      .setSecondaryButtonAccessory(new ButtonBuilder().setCustomId('panel_staff_refresh').setLabel('Refresh').setStyle(ButtonStyle.Secondary)))
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('### 📋 Current Ticket Queue'), new TextDisplayBuilder().setContent(openList))
    .addSeparatorComponents(sep())
    .addMediaGalleryComponents(bannerGallery('divider_bar.png'))
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('panel_staff_refresh').setLabel('Refresh Dashboard').setStyle(ButtonStyle.Secondary).setEmoji('🔄'),
      new ButtonBuilder().setCustomId('panel_leaderboard').setLabel('Leaderboard').setStyle(ButtonStyle.Secondary).setEmoji('🏆')));
  return { components: [container], files: [bannerFile('staff_banner.png'), bannerFile('divider_bar.png')], flags: MessageFlags.IsComponentsV2 };
}

module.exports = {
  category: 'utility', buildDashboardPanel, buildOrderPanel, buildTicketPanel, buildPricePanel, buildVouchesPanel, buildPortfolioPanel, buildStaffPanel,
  data: new SlashCommandBuilder().setName('panel').setDescription('Send an interactive panel to this channel (staff/manager only)')
    .addStringOption(opt => opt.setName('type').setDescription('Which panel to send').setRequired(true).addChoices(
      { name: 'Dashboard', value: 'dashboard' }, { name: 'Order Panel', value: 'order' }, { name: 'Ticket Panel', value: 'tickets' },
      { name: 'Price List', value: 'pricelist' }, { name: 'Vouches', value: 'vouches' }, { name: 'Portfolio', value: 'portfolio' }, { name: 'Staff Dashboard', value: 'staff' })),
  async execute(interaction) {
    if (!isStaff(interaction.member) && !isManager(interaction.member)) return interaction.reply({ embeds: [errorEmbed('Only Apex Designs staff can send panels.')], ephemeral: true });
    const config = getConfig(interaction.guild.id);
    if (!config.configured) return interaction.reply({ embeds: [errorEmbed('Run `/setup` first before sending panels.')], ephemeral: true });
    const type = interaction.options.getString('type');
    if (type === 'staff' && !isStaff(interaction.member)) return interaction.reply({ embeds: [errorEmbed('Only staff can post the staff panel.')], ephemeral: true });
    const builders = { dashboard: () => buildDashboardPanel(interaction.guild, config), order: () => buildOrderPanel(interaction.guild, config), tickets: () => buildTicketPanel(interaction.guild, config), pricelist: () => buildPricePanel(interaction.guild), vouches: () => buildVouchesPanel(interaction.guild), portfolio: () => buildPortfolioPanel(interaction.guild), staff: () => buildStaffPanel(interaction.guild) };
    await interaction.channel.send(builders[type]());
    await interaction.reply({ content: `✅ **${type}** panel sent.`, ephemeral: true });
  },
};
