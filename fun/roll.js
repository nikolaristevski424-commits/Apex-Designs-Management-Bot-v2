const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'fun', data: new SlashCommandBuilder().setName('roll').setDescription('Roll a die').addIntegerOption(o=>o.setName('sides').setDescription('Number of sides (default 6)').setMinValue(2).setMaxValue(1000).setRequired(false)),
  async execute(i) { const sides = i.options.getInteger('sides') || 6; const result = Math.floor(Math.random()*sides)+1; return i.reply({ embeds: [brandedEmbed({ title: '🎲 Dice Roll', description: `You rolled a **${result}** (d${sides})` }).embed] }); }
};
