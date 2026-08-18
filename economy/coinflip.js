const { SlashCommandBuilder } = require('discord.js');
const { getAccount, saveAccount, CURRENCY_EMOJI } = require('../../utils/economy');
const { brandedEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'economy', data: new SlashCommandBuilder().setName('coinflip').setDescription('Bet coins on a coin flip').addIntegerOption(o=>o.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1)).addStringOption(o=>o.setName('side').setDescription('Heads or tails').setRequired(true).addChoices({name:'Heads',value:'heads'},{name:'Tails',value:'tails'})),
  async execute(i) {
    const amount = i.options.getInteger('amount'); const side = i.options.getString('side');
    const acc = getAccount(i.guild.id, i.user.id);
    if (acc.balance < amount) return i.reply({ embeds: [errorEmbed(`You only have ${CURRENCY_EMOJI} ${acc.balance.toLocaleString()}.`)], ephemeral: true });
    const result = Math.random() < 0.5 ? 'heads' : 'tails'; const won = result === side;
    acc.balance += won ? amount : -amount; saveAccount(i.guild.id, i.user.id, acc);
    const { embed } = brandedEmbed({ title: won ? '🪙 You Won!' : '🪙 You Lost', description: `The coin landed on **${result}**. ${won ? `You won ${CURRENCY_EMOJI} ${amount.toLocaleString()}!` : `You lost ${CURRENCY_EMOJI} ${amount.toLocaleString()}.`}\nNew balance: ${CURRENCY_EMOJI} ${acc.balance.toLocaleString()}` });
    return i.reply({ embeds: [embed] });
  }
};
