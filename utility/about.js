const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'utility', data: new SlashCommandBuilder().setName('about').setDescription('About Apex Designs bot'),
  async execute(i) {
    const { embed, files } = brandedEmbed({ bannerKey: 'welcome', title: 'Apex Designs Bot', description: 'All-in-one Discord bot for **Apex Designs** — orders, Roblox payments, portfolio, vouches, staff tools, moderation, economy, leveling, and more.', fields: [{ name: 'Version', value: '2.0.0', inline:true },{ name: 'Built with', value: 'discord.js v14', inline:true },{ name: 'Commands', value: String(i.client.commands.size), inline:true }] });
    return i.reply({ embeds: [embed], files, ephemeral: true });
  }
};
