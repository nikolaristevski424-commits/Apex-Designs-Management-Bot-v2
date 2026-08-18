const { SlashCommandBuilder } = require('discord.js');
const { getAccount, saveAccount, CURRENCY_EMOJI } = require('../../utils/economy');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const COOLDOWN_MS = 30 * 60 * 1000;
module.exports = { category: 'economy', data: new SlashCommandBuilder().setName('rob').setDescription("Attempt to rob another member's wallet (risky!)").addUserOption(o=>o.setName('user').setDescription('Target').setRequired(true)),
  async execute(i) {
    const target = i.options.getUser('user');
    if (target.id === i.user.id) return i.reply({ embeds: [errorEmbed('You cannot rob yourself.')], ephemeral: true });
    if (target.bot) return i.reply({ embeds: [errorEmbed('You cannot rob a bot.')], ephemeral: true });
    const robber = getAccount(i.guild.id, i.user.id); const now = Date.now();
    if (robber.lastRob && now - new Date(robber.lastRob).getTime() < COOLDOWN_MS) {
      const mins = Math.ceil((COOLDOWN_MS - (now - new Date(robber.lastRob).getTime())) / 60000);
      return i.reply({ embeds: [errorEmbed(`You're laying low. Try again in ~${mins}m.`)], ephemeral: true });
    }
    const victim = getAccount(i.guild.id, target.id); robber.lastRob = new Date().toISOString();
    if (victim.balance < 50) { saveAccount(i.guild.id, i.user.id, robber); return i.reply({ embeds: [errorEmbed(`${target.username} doesn't have enough coins on hand to bother robbing.`)], ephemeral: true }); }
    const success = Math.random() < 0.4;
    if (success) {
      const amount = Math.floor(victim.balance * (0.1 + Math.random() * 0.2));
      victim.balance -= amount; robber.balance += amount; saveAccount(i.guild.id, target.id, victim); saveAccount(i.guild.id, i.user.id, robber);
      return i.reply({ embeds: [successEmbed(`You robbed ${CURRENCY_EMOJI} ${amount.toLocaleString()} from ${target}!`)] });
    }
    const fine = Math.floor(robber.balance * 0.15); robber.balance = Math.max(0, robber.balance - fine); saveAccount(i.guild.id, i.user.id, robber);
    return i.reply({ embeds: [errorEmbed(`You got caught and paid a ${CURRENCY_EMOJI} ${fine.toLocaleString()} fine!`)] });
  }
};
