const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'tools', data: new SlashCommandBuilder().setName('hexcolor').setDescription('Preview a hex color code').addStringOption(o=>o.setName('hex').setDescription('e.g. #d81c2a or d81c2a').setRequired(true)),
  async execute(i) {
    let hex = i.options.getString('hex').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return i.reply({ embeds: [errorEmbed('Enter a valid 6-digit hex code, e.g. `#d81c2a`.')], ephemeral: true });
    const int = parseInt(hex, 16); const r = (int >> 16) & 255, g = (int >> 8) & 255, b = int & 255;
    const embed = new EmbedBuilder().setColor(int).setTitle(`#${hex.toUpperCase()}`).addFields({ name: 'RGB', value: `${r}, ${g}, ${b}`, inline: true }, { name: 'HEX', value: `#${hex.toUpperCase()}`, inline: true });
    return i.reply({ embeds: [embed] });
  }
};
