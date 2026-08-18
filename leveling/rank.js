const { SlashCommandBuilder } = require('discord.js');
const { getSlice } = require('../../utils/storage');
const { getUser, xpForLevel } = require('../../utils/leveling');
const { brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'leveling', data: new SlashCommandBuilder().setName('rank').setDescription('Check your (or someone else\'s) level and XP').addUserOption(o=>o.setName('user').setDescription('Leave blank for yourself').setRequired(false)),
  async execute(i) {
    const target = i.options.getUser('user') || i.user;
    const u = getUser(i.guild.id, target.id);
    const all = getSlice('levels', i.guild.id, {});
    const ranked = Object.entries(all).sort((a,b)=> b[1].level - a[1].level || b[1].xp - a[1].xp);
    const position = ranked.findIndex(([id])=>id===target.id) + 1;
    const needed = xpForLevel(u.level);
    const bar = '█'.repeat(Math.round((u.xp/needed)*10)).padEnd(10, '░');
    const { embed } = brandedEmbed({ title: `${target.username}'s Rank`, fields: [{ name: 'Level', value: String(u.level), inline: true }, { name: 'Rank', value: `#${position || '—'}`, inline: true }, { name: 'XP', value: `${u.xp}/${needed}`, inline: true }, { name: 'Progress', value: `\`${bar}\`` }] });
    return i.reply({ embeds: [embed] });
  }
};
