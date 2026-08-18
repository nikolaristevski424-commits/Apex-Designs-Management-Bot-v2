const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'search', data: new SlashCommandBuilder().setName('define').setDescription('Look up a word definition').addStringOption(o=>o.setName('word').setDescription('Word to define').setRequired(true)),
  async execute(i) {
    const word = i.options.getString('word'); await i.deferReply();
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) return i.editReply({ embeds: [errorEmbed(`No definition found for **${word}**.`)] });
      const data = await res.json(); const entry = data[0]; const meaning = entry.meanings?.[0]; const def = meaning?.definitions?.[0];
      const { embed } = brandedEmbed({ title: `📖 ${entry.word}`, fields: [{ name: 'Part of Speech', value: meaning?.partOfSpeech || 'N/A', inline: true }, { name: 'Phonetic', value: entry.phonetic || 'N/A', inline: true }, { name: 'Definition', value: def?.definition || 'N/A' }, ...(def?.example ? [{ name: 'Example', value: def.example }] : [])] });
      return i.editReply({ embeds: [embed] });
    } catch { return i.editReply({ embeds: [errorEmbed('Could not fetch a definition right now.')] }); }
  }
};
