const { SlashCommandBuilder } = require('discord.js');
const { getAccount, saveAccount, WORK_MIN, WORK_MAX, CURRENCY_EMOJI } = require('../../utils/economy');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const COOLDOWN_MS = 60 * 60 * 1000;
const JOBS = ['designing a logo', 'animating a banner', 'rendering a thumbnail', 'coding a Discord bot', 'building a Roblox UI', 'editing a stream overlay'];
module.exports = { category: 'economy', data: new SlashCommandBuilder().setName('work').setDescription('Work a shift for some coins'),
  async execute(i) {
    const acc = getAccount(i.guild.id, i.user.id); const now = Date.now();
    if (acc.lastWork && now - new Date(acc.lastWork).getTime() < COOLDOWN_MS) {
      const mins = Math.ceil((COOLDOWN_MS - (now - new Date(acc.lastWork).getTime())) / 60000);
      return i.reply({ embeds: [errorEmbed(`You're still on cooldown. Try again in ~${mins}m.`)], ephemeral: true });
    }
    const earned = Math.floor(Math.random() * (WORK_MAX - WORK_MIN + 1)) + WORK_MIN;
    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    acc.balance += earned; acc.lastWork = new Date().toISOString(); saveAccount(i.guild.id, i.user.id, acc);
    return i.reply({ embeds: [successEmbed(`You spent an hour ${job} and earned **${CURRENCY_EMOJI} ${earned}**!`)] });
  }
};
