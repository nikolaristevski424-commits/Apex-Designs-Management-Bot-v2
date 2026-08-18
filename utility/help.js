const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed } = require('../../utils/embeds');
const CATS = { tickets:'🎫 Orders & Tickets', pricing:'💰 Pricing', portfolio:'🖼️ Portfolio & Vouches', staff:'🛠️ Staff', roblox:'🎮 Roblox', payments:'💸 Payments', moderation:'🛡️ Moderation', economy:'🪙 Economy', leveling:'📈 Leveling', birthday:'🎂 Birthday', giveaway:'🎉 Giveaways', jointocreate:'🔊 Voice', reactionroles:'🎭 Reaction Roles', serverstats:'📊 Server Stats', fun:'😄 Fun', community:'💡 Community', core:'🤖 Bot Info', music:'🎵 Music', tools:'🧰 Tools', verification:'✅ Verification', welcome:'👋 Welcome', search:'🔎 Search', utility:'⚙️ Utility' };
module.exports = { category: 'utility', data: new SlashCommandBuilder().setName('help').setDescription('List all Apex Designs bot commands')
  .addStringOption(o=>o.setName('category').setDescription('Filter to one category').setRequired(false)),
  async execute(i) {
    const filter = i.options.getString('category');
    const grouped = {};
    i.client.commands.forEach(cmd => { const c=cmd.category||'utility'; if(!grouped[c])grouped[c]=[]; grouped[c].push(`\`/${cmd.data.name}\` — ${cmd.data.description}`); });
    const entries = filter ? Object.entries(grouped).filter(([c])=>c===filter) : Object.entries(grouped);
    const fields = entries.map(([cat,lines])=>({ name: CATS[cat]||cat, value: lines.join('\n').slice(0,1000) }));
    const { embed, files } = brandedEmbed({ bannerKey: 'welcome', title: 'Apex Designs — Command List', description: `All commands organized by category. **${i.client.commands.size}** total commands.`, fields: fields.slice(0,25) });
    return i.reply({ embeds: [embed], files, ephemeral: true });
  }
};
