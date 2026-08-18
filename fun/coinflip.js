const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'fun', data: new SlashCommandBuilder().setName('flip').setDescription('Flip a coin, just for fun (no coins won/lost)'),
  async execute(i) { const result = Math.random() < 0.5 ? 'Heads' : 'Tails'; return i.reply({ embeds: [brandedEmbed({ title: '🪙 Coin Flip', description: `It landed on **${result}**!` }).embed] }); }
};
