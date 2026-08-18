const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'moderation', data: new SlashCommandBuilder().setName('purge').setDescription('Bulk delete recent messages (staff only)').addIntegerOption(o=>o.setName('amount').setDescription('Number of messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)).addUserOption(o=>o.setName('user').setDescription('Only delete messages from this user').setRequired(false)),
  async execute(i) {
    if (!isStaff(i.member) || !i.member.permissions.has(PermissionFlagsBits.ManageMessages)) return i.reply({ embeds: [errorEmbed('You need Manage Messages permission.')], ephemeral: true });
    const amount = i.options.getInteger('amount'); const user = i.options.getUser('user');
    await i.deferReply({ ephemeral: true });
    const fetched = await i.channel.messages.fetch({ limit: amount });
    const toDelete = user ? fetched.filter(m => m.author.id === user.id) : fetched;
    const deleted = await i.channel.bulkDelete(toDelete, true).catch(() => null);
    if (!deleted) return i.editReply({ embeds: [errorEmbed('Could not delete messages (they may be older than 14 days).')] });
    return i.editReply({ embeds: [successEmbed(`Deleted ${deleted.size} message(s).`)] });
  }
};
