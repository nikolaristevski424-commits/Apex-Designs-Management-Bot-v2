const { SlashCommandBuilder } = require('discord.js');
const { getAccount, saveAccount, CURRENCY_EMOJI } = require('../../utils/economy');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'economy', data: new SlashCommandBuilder().setName('bank').setDescription('Deposit or withdraw coins from your bank (bank balance is safe from /rob)').addStringOption(o=>o.setName('action').setDescription('Deposit or withdraw').setRequired(true).addChoices({name:'Deposit',value:'deposit'},{name:'Withdraw',value:'withdraw'})).addIntegerOption(o=>o.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1)),
  async execute(i) {
    const action = i.options.getString('action'); const amount = i.options.getInteger('amount');
    const acc = getAccount(i.guild.id, i.user.id);
    if (action === 'deposit') { if (acc.balance < amount) return i.reply({ embeds: [errorEmbed(`You only have ${CURRENCY_EMOJI} ${acc.balance.toLocaleString()} in your wallet.`)], ephemeral: true }); acc.balance -= amount; acc.bank += amount; }
    else { if (acc.bank < amount) return i.reply({ embeds: [errorEmbed(`You only have ${CURRENCY_EMOJI} ${acc.bank.toLocaleString()} in your bank.`)], ephemeral: true }); acc.bank -= amount; acc.balance += amount; }
    saveAccount(i.guild.id, i.user.id, acc);
    return i.reply({ embeds: [successEmbed(`${action === 'deposit' ? 'Deposited' : 'Withdrew'} ${CURRENCY_EMOJI} ${amount.toLocaleString()}. Wallet: ${CURRENCY_EMOJI}${acc.balance} | Bank: ${CURRENCY_EMOJI}${acc.bank}`)] });
  }
};
