const { SlashCommandBuilder } = require('discord.js');
const { getAccount, CURRENCY_EMOJI, CURRENCY_NAME } = require('../../utils/economy');
const { brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'economy', data: new SlashCommandBuilder().setName('balance').setDescription(`Check your ${CURRENCY_NAME} balance`).addUserOption(o=>o.setName('user').setDescription('Leave blank for yourself').setRequired(false)),
  async execute(i) {
    const target = i.options.getUser('user') || i.user;
    const acc = getAccount(i.guild.id, target.id);
    const { embed } = brandedEmbed({ title: `${target.username}'s Wallet`, fields: [{ name: 'Wallet', value: `${CURRENCY_EMOJI} ${acc.balance.toLocaleString()}`, inline: true }, { name: 'Bank', value: `${CURRENCY_EMOJI} ${acc.bank.toLocaleString()}`, inline: true }, { name: 'Net Worth', value: `${CURRENCY_EMOJI} ${(acc.balance+acc.bank).toLocaleString()}`, inline: true }] });
    return i.reply({ embeds: [embed] });
  }
};
