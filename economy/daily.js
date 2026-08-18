const { SlashCommandBuilder } = require('discord.js');
const { getAccount, saveAccount, DAILY_AMOUNT, CURRENCY_EMOJI } = require('../../utils/economy');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const DAY_MS = 24 * 60 * 60 * 1000;
module.exports = { category: 'economy', data: new SlashCommandBuilder().setName('daily').setDescription('Claim your daily coins'),
  async execute(i) {
    const acc = getAccount(i.guild.id, i.user.id); const now = Date.now();
    if (acc.lastDaily && now - new Date(acc.lastDaily).getTime() < DAY_MS) {
      const hrs = Math.ceil((DAY_MS - (now - new Date(acc.lastDaily).getTime())) / (60*60*1000));
      return i.reply({ embeds: [errorEmbed(`You already claimed your daily. Come back in ~${hrs}h.`)], ephemeral: true });
    }
    acc.balance += DAILY_AMOUNT; acc.lastDaily = new Date().toISOString(); saveAccount(i.guild.id, i.user.id, acc);
    return i.reply({ embeds: [successEmbed(`You claimed your daily **${CURRENCY_EMOJI} ${DAILY_AMOUNT}**! New balance: ${CURRENCY_EMOJI} ${acc.balance.toLocaleString()}`)] });
  }
};
