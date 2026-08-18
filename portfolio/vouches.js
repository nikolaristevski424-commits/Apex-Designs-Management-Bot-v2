const { SlashCommandBuilder } = require('discord.js');
const { getSlice } = require('../../utils/storage');
const { brandedEmbed } = require('../../utils/embeds');
function avg(d){ return d.count ? (d.totalRating/d.count).toFixed(1) : '0.0'; }
module.exports = { category: 'portfolio', data: new SlashCommandBuilder().setName('vouches').setDescription('View vouch stats for a designer or the team leaderboard').addUserOption(o => o.setName('designer').setDescription('Leave blank for team leaderboard').setRequired(false)),
  async execute(i) {
    const vouches = getSlice('vouches', i.guild.id, {}); const designer = i.options.getUser('designer');
    if (designer) {
      const d = vouches[designer.id]||{ count:0, totalRating:0, entries:[] };
      const recent = d.entries.slice(0,5).map(e=>`⭐${e.rating} — "${e.comment}" — <@${e.from}>`).join('\n')||'No reviews yet.';
      const { embed, files } = brandedEmbed({ bannerKey: 'vouch', title: `${designer.username}'s Vouches`, fields: [{ name: 'Total', value: String(d.count), inline:true }, { name: 'Average', value: `⭐ ${avg(d)}/5`, inline:true }, { name: 'Recent Reviews', value: recent.slice(0,1000) }] });
      return i.reply({ embeds: [embed], files });
    }
    const ranked = Object.entries(vouches).map(([id,d])=>({ id, count:d.count, a:Number(avg(d)) })).sort((a,b)=>b.count-a.count).slice(0,10);
    if (!ranked.length) return i.reply({ embeds: [brandedEmbed({ title:'Team Vouches', description:'No vouches yet.' }).embed] });
    const medals=['🥇','🥈','🥉'];
    const lines = ranked.map((r,idx)=>`${medals[idx]||`${idx+1}.`} <@${r.id}> — **${r.count}** vouches — ⭐ ${r.a}/5`);
    const { embed, files } = brandedEmbed({ bannerKey: 'vouch', title: 'Apex Designs — Team Vouches', description: lines.join('\n') });
    return i.reply({ embeds: [embed], files });
  }
};
