const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getConfig } = require('../../utils/guildConfig');
const { getSlice, setSlice } = require('../../utils/storage');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, brandedEmbed, BRAND } = require('../../utils/embeds');
const ROBLOX_TAX = 0.30;
const DESIGN_TYPES = ['Start Livery', 'Job Livery', 'FD Livery', 'Uniform', 'Logo', 'Banner', 'Icon/PFP', 'GFX', 'Discord Server', 'Discord Bot', 'UI Design', 'Roblox Game Asset', 'Branding Package', 'Other'];

module.exports = {
  category: 'payments',
  data: new SlashCommandBuilder().setName('payment-request').setDescription('Request Robux payment for a completed order (staff only)')
    .addStringOption(o => o.setName('type').setDescription('Design type').setRequired(true).addChoices(...DESIGN_TYPES.map(t => ({ name: t, value: t }))))
    .addIntegerOption(o => o.setName('price').setDescription('Price in Robux (what customer pays — BEFORE Roblox 30% tax)').setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName('roblox_username').setDescription("Customer's Roblox username").setRequired(true))
    .addUserOption(o => o.setName('customer').setDescription('Customer Discord user').setRequired(true))
    .addStringOption(o => o.setName('payment_link').setDescription('Roblox gamepass URL for payment').setRequired(true))
    .addChannelOption(o => o.setName('order_channel').setDescription('The order ticket channel').setRequired(false))
    .addIntegerOption(o => o.setName('quantity').setDescription('Quantity (default: 1)').setMinValue(1).setRequired(false)),

  async execute(interaction) {
    if (!isStaff(interaction.member)) return interaction.reply({ embeds: [errorEmbed('Only Apex Designs staff can send payment requests.')], ephemeral: true });
    const cfg = getConfig(interaction.guild.id);
    const type = interaction.options.getString('type'); const price = interaction.options.getInteger('price');
    const robloxUsername = interaction.options.getString('roblox_username'); const customer = interaction.options.getUser('customer');
    const paymentLink = interaction.options.getString('payment_link'); const orderChannel = interaction.options.getChannel('order_channel');
    const quantity = interaction.options.getInteger('quantity') || 1; const totalPrice = price * quantity;
    const afterTax = Math.floor(totalPrice * (1 - ROBLOX_TAX)); const taxAmount = totalPrice - afterTax;
    const designerCut = cfg.designerCut ?? 95; const designerPayout = Math.floor(afterTax * (designerCut / 100)); const serverCut = afterTax - designerPayout;

    const payments = getSlice('payment_requests', interaction.guild.id, { count: 0, requests: {} });
    payments.count = (payments.count || 0) + 1; const reqNumber = payments.count;

    const embed = new EmbedBuilder().setColor(BRAND.red).setTitle(`Payment Request #${reqNumber}`)
      .setAuthor({ name: `From: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .addFields(
        { name: 'Order Type', value: type, inline: true }, { name: 'Quantity', value: String(quantity), inline: true }, { name: 'Status', value: '🟡 Awaiting Payment', inline: true },
        { name: 'Customer', value: `${customer} (${customer.tag})`, inline: true }, { name: 'Customer Roblox', value: `\`${robloxUsername}\``, inline: true }, { name: 'Order Channel', value: orderChannel ? `${orderChannel}` : 'N/A', inline: true },
        { name: 'Designer', value: `${interaction.user}`, inline: true }, { name: 'Payment Request Date', value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true }, { name: '⠀', value: '⠀', inline: false },
        { name: '💰 Price Calculations', value: [`**Price on gamepass link:** \`${totalPrice.toLocaleString()}\` 🔵`, `**After Roblox 30% tax:** \`${afterTax.toLocaleString()}\` 🔵`, `**Designer payout (${designerCut}%):** \`${designerPayout.toLocaleString()}\` 🔵`, serverCut > 0 ? `**Server cut (${100-designerCut}%):** \`${serverCut.toLocaleString()}\` 🔵` : ''].filter(Boolean).join('\n'), inline: false },
        { name: '🔗 Payment Link', value: `[Click here to pay on Roblox](${paymentLink})\n-# Set gamepass price to **${totalPrice.toLocaleString()} Robux**` },
      ).setFooter({ text: `Apex Designs • Payment Request #${reqNumber} • If gamepass shows error 404, click Unlock and request parental permission.` }).setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`payment_paid_${reqNumber}_${interaction.guild.id}`).setLabel('Paid').setStyle(ButtonStyle.Success).setEmoji('✅'),
      new ButtonBuilder().setLabel('Pay Now').setStyle(ButtonStyle.Link).setURL(paymentLink).setEmoji('💸'),
      new ButtonBuilder().setCustomId(`payment_decline_${reqNumber}_${interaction.guild.id}`).setLabel('Decline').setStyle(ButtonStyle.Danger).setEmoji('❌'));

    const targetChannel = orderChannel || interaction.channel;
    const msg = await targetChannel.send({ embeds: [embed], components: [buttons] });

    payments.requests[reqNumber] = { reqNumber, type, price: totalPrice, afterTax, designerPayout, serverCut, robloxUsername, customerId: customer.id, designerId: interaction.user.id, paymentLink, orderChannelId: orderChannel?.id || interaction.channel.id, messageId: msg.id, channelId: targetChannel.id, status: 'awaiting', requestedAt: new Date().toISOString() };
    setSlice('payment_requests', interaction.guild.id, payments);

    if (targetChannel.id !== interaction.channel.id) await interaction.reply({ embeds: [brandedEmbed({ description: `✅ Payment request #${reqNumber} sent in ${targetChannel}.` }).embed], ephemeral: true });
    else await interaction.reply({ content: '✅ Payment request sent.', ephemeral: true });

    await customer.send({ embeds: [new EmbedBuilder().setColor(BRAND.red).setTitle('Payment Required — Apex Designs Order')
      .setDescription(`You have a pending Robux payment for your **${type}** order.\n\n**Amount:** \`${totalPrice.toLocaleString()}\` Robux\n\n[**Click here to pay on Roblox**](${paymentLink})\n\n-# Once paid, notify your designer in ${orderChannel || interaction.channel}.`)
      .setFooter({ text: 'Apex Designs • Stand Above The Rest.' }).setTimestamp()] }).catch(() => {});
  },
};
