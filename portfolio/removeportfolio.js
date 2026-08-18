const { SlashCommandBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'portfolio', data: new SlashCommandBuilder().setName('removeportfolio').setDescription('Remove a portfolio item by position (staff only)').addIntegerOption(o => o.setName('position').setDescription('Position (1=newest)').setRequired(true).setMinValue(1)),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const pos = i.options.getInteger('position'); const items = getSlice('portfolio', i.guild.id, []);
    if (pos > items.length) return i.reply({ embeds: [errorEmbed(`Only ${items.length} items.`)], ephemeral: true });
    items.splice(pos-1,1); setSlice('portfolio', i.guild.id, items);
    return i.reply({ embeds: [successEmbed(`Item #${pos} removed.`)] });
  }
};
