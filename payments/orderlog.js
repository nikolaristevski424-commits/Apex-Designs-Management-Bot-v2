const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getConfig } = require('../../utils/guildConfig');
const { getSlice, setSlice } = require('../../utils/storage');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, BRAND } = require('../../utils/embeds');
module.exports = { category: 'payments', data: new SlashCommandBuilder().setName('orderlog').setDescription('Log a completed order to the payment log channel (staff only)')
  .addUserOption(o => o.setName('customer').setDescription('Customer Discord user').setRequired(true)).addIntegerOption(o => o.setName('price').setDescription('Final price in Robux').setRequired(true).setMinValue(1))
  .addStringOption(o => o.setName('roblox_username').setDescription("Designer's Roblox username").setRequired(true)).addStringOption(o => o.setName('type').setDescription('Order/design type').setRequired(true))
  .addChannelOption(o => o.setName('ticket').setDescription('Order ticket channel').setRequired(false)).addUserOption(o => o.setName('designer').setDescription('Designer (defaults to you)').setRequired(false)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) return interaction.reply({ embeds: [errorEmbed('Only Apex Designs staff can log orders.')], ephemeral: true });
    const cfg = getConfig(interaction.guild.id);
    const customer = interaction.options.getUser('customer'); const price = interaction.options.getInteger('price'); const robloxUsername = interaction.options.getString('roblox_username');
    const type = interaction.options.getString('type'); const ticket = interaction.options.getChannel('ticket'); const designer = interaction.options.getUser('designer') || interaction.user;
    const designerCut = cfg.designerCut ?? 95; const payout = Math.floor(price * (designerCut / 100));
    const logs = getSlice('order_logs', interaction.guild.id, { count: 0, logs: [] }); logs.count = (logs.count||0)+1; const logNumber = logs.count;
    logs.logs.unshift({ logNumber, customerId: customer.id, designerId: designer.id, price, payout, type, robloxUsername, ticketId: ticket?.id || null, loggedBy: interaction.user.id, loggedAt: new Date().toISOString() });
    logs.logs = logs.logs.slice(0, 500); setSlice('order_logs', interaction.guild.id, logs);
    const sd = getSlice('staff', interaction.guild.id, { stats: {} });
    if (!sd.stats[designer.id]) sd.stats[designer.id] = { claimed: 0, completed: 0, totalEarned: 0 };
    sd.stats[designer.id].completed += 1; sd.stats[designer.id].totalEarned = (sd.stats[designer.id].totalEarned||0) + payout; setSlice('staff', interaction.guild.id, sd);
    const embed = new EmbedBuilder().setColor(BRAND.red).setTitle('Order Logged')
      .addFields({ name: 'Ticket', value: ticket ? `${ticket}` : 'N/A', inline: false }, { name: 'Customer', value: `${customer.username}`, inline: true }, { name: 'Price', value: `${price.toLocaleString()} Robux`, inline: true },
        { name: 'Designer', value: `${designer}`, inline: true }, { name: 'Roblox Username', value: `\`${robloxUsername}\``, inline: true }, { name: 'Order Type', value: type, inline: true },
        { name: 'Payout', value: `${payout.toLocaleString()} Robux (${designerCut}% of ${price.toLocaleString()})`, inline: false })
      .setFooter({ text: `Logged by ${interaction.user.username} • Log #${logNumber}` }).setTimestamp();
    const logChId = cfg.paymentLogChannelId || cfg.logChannelId; const logCh = logChId ? interaction.guild.channels.cache.get(logChId) : null;
    if (logCh) { await logCh.send({ embeds: [embed] }); return interaction.reply({ content: `✅ Order log #${logNumber} posted in ${logCh}.`, ephemeral: true }); }
    return interaction.reply({ embeds: [embed] });
  },
};
