const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'search', data: new SlashCommandBuilder().setName('wiki').setDescription('Search Wikipedia').addStringOption(o=>o.setName('query').setDescription('What to search for').setRequired(true)),
  async execute(i) {
    const query = i.options.getString('query'); await i.deferReply();
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      if (!res.ok) return i.editReply({ embeds: [errorEmbed(`No Wikipedia article found for **${query}**.`)] });
      const data = await res.json();
      const { embed } = brandedEmbed({ title: data.title, description: data.extract?.slice(0, 1000), fields: [{ name: 'Read more', value: data.content_urls?.desktop?.page || 'N/A' }] });
      if (data.thumbnail?.source) embed.setThumbnail(data.thumbnail.source);
      return i.editReply({ embeds: [embed] });
    } catch { return i.editReply({ embeds: [errorEmbed('Could not fetch that right now.')] }); }
  }
};
