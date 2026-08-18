const { SlashCommandBuilder } = require('discord.js');
const { getSlice } = require('../../utils/storage');
const { brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'staff', data: new SlashCommandBuilder().setName('leaderboard').setDescription('Top Apex Designs staff by completed orders'),
  async execute(i) {
    const sd = getSlice('staff', i.guild.id, { stats:{} });
    const ranked = Object.entries(sd.stats).map(([id,s])=>({ id,...s })).sort((a,b)=>b.completed-a.completed).slice(0,10);
    if (!ranked.length) return i.reply({ embeds: [brandedEmbed({ title:'Staff Leaderboard', description:'No completed orders yet.' }).embed] });
    const medals=['🥇','🥈','🥉'];
    const lines = ranked.map((r,idx)=>`${medals[idx]||`${idx+1}.`} <@${r.id}> — **${r.completed}** completed, ${r.claimed} claimed`);
    const { embed, files } = brandedEmbed({ bannerKey: 'staff', title: 'Apex Designs — Staff Leaderboard', description: lines.join('\n') });
    return i.reply({ embeds: [embed], files });
  }
};
