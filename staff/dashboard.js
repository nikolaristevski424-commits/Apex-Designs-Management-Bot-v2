const { SlashCommandBuilder } = require('discord.js');
const { getSlice } = require('../../utils/storage');
const { getAllTickets } = require('../../utils/tickets');
const { isStaff } = require('../../utils/permissions');
const { brandedEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'staff', data: new SlashCommandBuilder().setName('dashboard').setDescription('View the staff operations dashboard (staff only)'),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const tickets = Object.values(getAllTickets(i.guild.id));
    const sd = getSlice('staff', i.guild.id, { stats: {} });
    const vouches = getSlice('vouches', i.guild.id, {});
    const open = tickets.filter(o=>o.status==='open').length;
    const claimed = tickets.filter(o=>o.status==='claimed').length;
    const closed = tickets.filter(o=>o.status==='closed').length;
    const orders = tickets.filter(t=>t.kind==='order').length;
    const support = tickets.filter(t=>t.kind==='support').length;
    const mine = tickets.filter(o=>o.claimedBy===i.user.id&&o.status!=='closed').length;
    const myDone = sd.stats[i.user.id]?.completed||0;
    let topId=null, topAvg=0;
    Object.entries(vouches).forEach(([id,d])=>{ if(!d.count) return; const a=d.totalRating/d.count; if(a>topAvg){topAvg=a;topId=id;} });
    const { embed, files } = brandedEmbed({ bannerKey: 'staff', title: 'Staff Dashboard', description: `Live overview — **${i.guild.name}**`, fields: [
      { name: '🟢 Open', value: String(open), inline:true }, { name: '🔵 Active', value: String(claimed), inline:true }, { name: '✅ Completed (all-time)', value: String(closed), inline:true },
      { name: '📦 Orders', value: String(orders), inline:true }, { name: '🎫 Support', value: String(support), inline:true }, { name: 'Your active claims', value: String(mine), inline:true },
      { name: 'Your completed', value: String(myDone), inline:true }, { name: 'Top rated designer', value: topId ? `<@${topId}> (⭐${topAvg.toFixed(1)})` : 'No data yet', inline:true },
    ] });
    return i.reply({ embeds: [embed], files, ephemeral: true });
  }
};
