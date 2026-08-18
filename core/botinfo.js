const { SlashCommandBuilder, version: djsVersion } = require('discord.js');
const { brandedEmbed } = require('../../utils/embeds');
function formatUptime(ms) { const s = Math.floor(ms/1000)%60, m = Math.floor(ms/60000)%60, h = Math.floor(ms/3600000)%24, d = Math.floor(ms/86400000); return `${d}d ${h}h ${m}m ${s}s`; }
module.exports = { category: 'core', data: new SlashCommandBuilder().setName('botinfo').setDescription('View bot statistics'),
  async execute(i) {
    const { embed, files } = brandedEmbed({ bannerKey: 'welcome', title: 'Apex Designs Bot — Stats', fields: [
      { name: 'Servers', value: String(i.client.guilds.cache.size), inline: true }, { name: 'Users (cached)', value: String(i.client.users.cache.size), inline: true }, { name: 'Uptime', value: formatUptime(i.client.uptime), inline: true },
      { name: 'Ping', value: `${Math.round(i.client.ws.ping)}ms`, inline: true }, { name: 'discord.js', value: djsVersion, inline: true }, { name: 'Node.js', value: process.version, inline: true },
    ] });
    return i.reply({ embeds: [embed], files });
  }
};
