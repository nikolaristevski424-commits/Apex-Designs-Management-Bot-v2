const { SlashCommandBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { isStaff } = require('../../utils/permissions');
const { brandedEmbed, successEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = {
  category: 'payments',
  data: new SlashCommandBuilder().setName('credits').setDescription('Manage Robux store credit balances')
    .addSubcommand(s => s.setName('view').setDescription('View a store credit balance').addUserOption(o => o.setName('user').setDescription('Leave blank for yourself').setRequired(false)))
    .addSubcommand(s => s.setName('add').setDescription('Add store credit (staff only)').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addIntegerOption(o => o.setName('amount').setDescription('Robux amount').setRequired(true).setMinValue(1)).addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove store credit (staff only)').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addIntegerOption(o => o.setName('amount').setDescription('Robux amount').setRequired(true).setMinValue(1)).addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true))),
  async execute(i) {
    const sub = i.options.getSubcommand();
    const credits = getSlice('store_credits', i.guild.id, {});
    if (sub === 'view') {
      const target = i.options.getUser('user') || i.user;
      const entry = credits[target.id] || { balance: 0, history: [] };
      const { embed } = brandedEmbed({ title: `${target.username}'s Store Credit`, description: `Balance: **${entry.balance.toLocaleString()} Robux**` });
      return i.reply({ embeds: [embed] });
    }
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Only staff can add or remove store credit.')], ephemeral: true });
    const user = i.options.getUser('user'); const amount = i.options.getInteger('amount'); const reason = i.options.getString('reason');
    if (!credits[user.id]) credits[user.id] = { balance: 0, history: [] };
    if (sub === 'add') { credits[user.id].balance += amount; credits[user.id].history.unshift({ type: 'add', amount, reason, staffId: i.user.id, at: new Date().toISOString() }); }
    else {
      if (credits[user.id].balance < amount) return i.reply({ embeds: [errorEmbed(`${user.username} only has ${credits[user.id].balance} credit.`)], ephemeral: true });
      credits[user.id].balance -= amount; credits[user.id].history.unshift({ type: 'remove', amount, reason, staffId: i.user.id, at: new Date().toISOString() });
    }
    credits[user.id].history = credits[user.id].history.slice(0, 50); setSlice('store_credits', i.guild.id, credits);
    return i.reply({ embeds: [successEmbed(`${sub === 'add' ? 'Added' : 'Removed'} **${amount} Robux** ${sub === 'add' ? 'to' : 'from'} ${user}'s store credit. New balance: ${credits[user.id].balance.toLocaleString()}`)] });
  },
};
