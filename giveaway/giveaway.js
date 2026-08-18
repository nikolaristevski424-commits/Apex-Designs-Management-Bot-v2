const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed, BRAND } = require('../../utils/embeds');

function parseDuration(str) {
  const m = str.match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2].toLowerCase()];
  return n * mult;
}

async function pickWinners(guild, giveaway, count) {
  const channel = guild.channels.cache.get(giveaway.channelId);
  if (!channel) return [];
  const msg = await channel.messages.fetch(giveaway.messageId).catch(() => null);
  if (!msg) return [];
  const reaction = msg.reactions.cache.get('🎉');
  if (!reaction) return [];
  const users = (await reaction.users.fetch()).filter(u => !u.bot);
  const pool = [...users.values()];
  const winners = [];
  while (winners.length < count && pool.length) { const idx = Math.floor(Math.random() * pool.length); winners.push(pool.splice(idx, 1)[0]); }
  return winners;
}

module.exports = {
  category: 'giveaway', parseDuration, pickWinners,
  data: new SlashCommandBuilder().setName('giveaway').setDescription('Manage giveaways (staff only)')
    .addSubcommand(s => s.setName('start').setDescription('Start a giveaway').addStringOption(o=>o.setName('prize').setDescription('What are you giving away?').setRequired(true)).addStringOption(o=>o.setName('duration').setDescription('e.g. 30s, 10m, 1h, 2d').setRequired(true)).addIntegerOption(o=>o.setName('winners').setDescription('Number of winners').setMinValue(1).setMaxValue(20).setRequired(false)))
    .addSubcommand(s => s.setName('end').setDescription('End a giveaway early').addStringOption(o=>o.setName('message_id').setDescription('Giveaway message ID').setRequired(true)))
    .addSubcommand(s => s.setName('reroll').setDescription('Reroll winners for a giveaway').addStringOption(o=>o.setName('message_id').setDescription('Giveaway message ID').setRequired(true))),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const sub = i.options.getSubcommand();
    const giveaways = getSlice('giveaways', i.guild.id, {});
    if (sub === 'start') {
      const prize = i.options.getString('prize'); const durationStr = i.options.getString('duration'); const winnerCount = i.options.getInteger('winners') || 1;
      const ms = parseDuration(durationStr);
      if (!ms || ms < 5000) return i.reply({ embeds: [errorEmbed('Invalid duration. Use formats like 30s, 10m, 1h, 2d.')], ephemeral: true });
      const endsAt = Date.now() + ms;
      const embed = new EmbedBuilder().setColor(BRAND.red).setTitle(`🎉 Giveaway: ${prize}`).setDescription(`React with 🎉 to enter!\nWinners: **${winnerCount}**\nEnds: <t:${Math.floor(endsAt/1000)}:R>`).setFooter({ text: 'Apex Designs Giveaway' }).setTimestamp(endsAt);
      const msg = await i.channel.send({ embeds: [embed] }); await msg.react('🎉').catch(() => {});
      giveaways[msg.id] = { prize, winnerCount, endsAt, channelId: i.channel.id, hostId: i.user.id, ended: false }; setSlice('giveaways', i.guild.id, giveaways);
      return i.reply({ embeds: [successEmbed('Giveaway started!')], ephemeral: true });
    }
    if (sub === 'end' || sub === 'reroll') {
      const messageId = i.options.getString('message_id'); const giveaway = giveaways[messageId];
      if (!giveaway) return i.reply({ embeds: [errorEmbed('No giveaway found with that message ID.')], ephemeral: true });
      const winners = await pickWinners(i.guild, giveaway, giveaway.winnerCount);
      giveaway.ended = true; setSlice('giveaways', i.guild.id, giveaways);
      const channel = i.guild.channels.cache.get(giveaway.channelId);
      if (!winners.length) await channel?.send(`No valid entries for the **${giveaway.prize}** giveaway.`).catch(() => {});
      else await channel?.send(`🎉 Congrats ${winners.map(w => `${w}`).join(', ')}! You won **${giveaway.prize}**!`).catch(() => {});
      return i.reply({ embeds: [successEmbed(sub === 'end' ? 'Giveaway ended.' : 'Giveaway rerolled.')], ephemeral: true });
    }
  },
};
