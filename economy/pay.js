const { SlashCommandBuilder } = require('discord.js');
const { getAccount, saveAccount, CURRENCY_EMOJI } = require('../../utils/economy');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'economy', data: new SlashCommandBuilder().setName('pay').setDescription('Send coins to another member').addUserOption(o=>o.setName('user').setDescription('Recipient').setRequired(true)).addIntegerOption(o=>o.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1)),
  async execute(i) {
    const target = i.options.getUser('user'); const amount = i.options.getInteger('amount');
    if (target.id === i.user.id) return i.reply({ embeds: [errorEmbed('You cannot pay yourself.')], ephemeral: true });
    if (target.bot) return i.reply({ embeds: [errorEmbed('You cannot pay a bot.')], ephemeral: true });
    const sender = getAccount(i.guild.id, i.user.id);
    if (sender.balance < amount) return i.reply({ embeds: [errorEmbed(`You only have ${CURRENCY_EMOJI} ${sender.balance.toLocaleString()}.`)], ephemeral: true });
    sender.balance -= amount; saveAccount(i.guild.id, i.user.id, sender);
    const receiver = getAccount(i.guild.id, target.id); receiver.balance += amount; saveAccount(i.guild.id, target.id, receiver);
    return i.reply({ embeds: [successEmbed(`Sent ${CURRENCY_EMOJI} ${amount.toLocaleString()} to ${target}!`)] });
  }
};
