const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { updateConfig } = require('../../utils/guildConfig');
const { isManager } = require('../../utils/permissions');
const { brandedEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'utility', data: new SlashCommandBuilder().setName('setup').setDescription('Configure the Apex Designs bot (managers only)')
  .addChannelOption(o=>o.setName('ticket_category').setDescription('Category for order tickets').addChannelTypes(ChannelType.GuildCategory).setRequired(true))
  .addRoleOption(o=>o.setName('staff_role').setDescription('Apex Designs staff role').setRequired(true))
  .addChannelOption(o=>o.setName('support_category').setDescription('Category for general support tickets (defaults to ticket_category)').addChannelTypes(ChannelType.GuildCategory).setRequired(false))
  .addChannelOption(o=>o.setName('log_channel').setDescription('Order + payment log channel').addChannelTypes(ChannelType.GuildText).setRequired(false))
  .addChannelOption(o=>o.setName('payment_log_channel').setDescription('Dedicated payment log channel').addChannelTypes(ChannelType.GuildText).setRequired(false))
  .addChannelOption(o=>o.setName('vouch_channel').setDescription('Reviews channel').addChannelTypes(ChannelType.GuildText).setRequired(false))
  .addChannelOption(o=>o.setName('applications_channel').setDescription('Staff applications channel').addChannelTypes(ChannelType.GuildText).setRequired(false))
  .addChannelOption(o=>o.setName('mod_log_channel').setDescription('Moderation + message log channel').addChannelTypes(ChannelType.GuildText).setRequired(false))
  .addRoleOption(o=>o.setName('customer_role').setDescription('Role given to customers').setRequired(false))
  .addStringOption(o=>o.setName('payment_info').setDescription('Payment instructions shown on invoices').setRequired(false))
  .addStringOption(o=>o.setName('tos_url').setDescription('Terms of Service URL').setRequired(false))
  .addNumberOption(o=>o.setName('designer_cut').setDescription('Designer payout % (default: 95)').setMinValue(1).setMaxValue(100).setRequired(false))
  .addIntegerOption(o=>o.setName('max_tickets_per_user').setDescription('Max open tickets per user (default: 3)').setMinValue(1).setMaxValue(20).setRequired(false))
  .addStringOption(o=>o.setName('prefix').setDescription('Prefix for panel shortcuts like -orderpanel (default: -)').setRequired(false)),
  async execute(i) {
    if (!isManager(i.member)) return i.reply({ embeds: [errorEmbed('Managers only.')], ephemeral: true });
    const updated = updateConfig(i.guild.id, {
      ticketCategoryId: i.options.getChannel('ticket_category').id,
      staffRoleId: i.options.getRole('staff_role').id,
      supportCategoryId: i.options.getChannel('support_category')?.id || null,
      logChannelId: i.options.getChannel('log_channel')?.id || null,
      paymentLogChannelId: i.options.getChannel('payment_log_channel')?.id || null,
      vouchChannelId: i.options.getChannel('vouch_channel')?.id || null,
      applicationsChannelId: i.options.getChannel('applications_channel')?.id || null,
      modLogChannelId: i.options.getChannel('mod_log_channel')?.id || null,
      customerRoleId: i.options.getRole('customer_role')?.id || null,
      paymentInfo: i.options.getString('payment_info') || null,
      tosUrl: i.options.getString('tos_url') || null,
      designerCut: i.options.getNumber('designer_cut') || 95,
      maxTicketsPerUser: i.options.getInteger('max_tickets_per_user') || 3,
      prefix: i.options.getString('prefix') || '-',
      configured: true,
    });
    const { embed, files } = brandedEmbed({ bannerKey: 'welcome', title: '⚙️ Setup Complete', description: 'Apex Designs bot is ready!', fields: [
      { name: 'Ticket Category', value: `<#${updated.ticketCategoryId}>`, inline: true }, { name: 'Staff Role', value: `<@&${updated.staffRoleId}>`, inline: true }, { name: 'Support Category', value: updated.supportCategoryId ? `<#${updated.supportCategoryId}>` : 'Uses ticket category', inline: true },
      { name: 'Log Channel', value: updated.logChannelId ? `<#${updated.logChannelId}>` : 'Not set', inline: true }, { name: 'Designer Cut', value: `${updated.designerCut}%`, inline: true }, { name: 'Prefix', value: `\`${updated.prefix}\``, inline: true },
      { name: 'Next Steps', value: '`/addstaff` · `/setprice` · `/addportfolio` · `/panel dashboard`\nTry `-orderpanel` or `-ticketpanel` in any channel too!' },
    ] });
    return i.reply({ embeds: [embed], files, ephemeral: true });
  }
};
