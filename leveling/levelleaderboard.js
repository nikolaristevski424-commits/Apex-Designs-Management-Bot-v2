const { SlashCommandBuilder } = require('discord.js');
const { getSlice } = require('../../utils/storage');
const { brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'leveling', data: new SlashCommandBuilder().setName('levels').setDescription('See the server XP leaderboard'),
  async execute(i) {
    const all = getSlice('levels', i.guild.id, {});
    const ranked = Object.entries(all).sort((a,b)=> b[1].level - a[1].level || b[1].xp - a[1].xp).slice(0,10);
    if (!ranked.length) return i.reply({ embeds: [brandedEmbed({ title: 'XP Leaderboard', description: 'No activity tracked yet.' }).embed] });
    const medals=['🥇','🥈','🥉'];
    const lines = ranked.map(([id,u],idx)=>`${medals[idx]||`${idx+1}.`} <@${id}> — Level **${u.level}** (${u.xp} XP)`);
    const { embed } = brandedEmbed({ title: 'XP Leaderboard', description: lines.join('\n') });
    return i.reply({ embeds: [embed] });
  }
};
