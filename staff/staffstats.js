const { SlashCommandBuilder } = require('discord.js');
const { getSlice } = require('../../utils/storage');
const { brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'staff', data: new SlashCommandBuilder().setName('staffstats').setDescription('View performance stats for a staff member').addUserOption(o=>o.setName('staff').setDescription('Leave blank for your own stats').setRequired(false)),
  async execute(i) {
    const target = i.options.getUser('staff')||i.user;
    const sd = getSlice('staff', i.guild.id, { stats:{} }); const stats = sd.stats[target.id]||{ claimed:0, completed:0, totalEarned:0 };
    const vd = (getSlice('vouches', i.guild.id, {})[target.id])||{ count:0, totalRating:0 };
    const avg = vd.count ? (vd.totalRating/vd.count).toFixed(1) : '0.0';
    const { embed, files } = brandedEmbed({ bannerKey: 'staff', title: `${target.username}'s Stats`, fields: [{ name: 'Claimed', value: String(stats.claimed), inline:true }, { name: 'Completed', value: String(stats.completed), inline:true }, { name: 'Vouches', value: `${vd.count} (⭐ ${avg}/5)`, inline:true }, { name: 'Robux Earned', value: String(stats.totalEarned||0), inline:true }] });
    return i.reply({ embeds: [embed], files });
  }
};
