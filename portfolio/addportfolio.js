const { SlashCommandBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'portfolio', data: new SlashCommandBuilder().setName('addportfolio').setDescription('Add a piece to the portfolio (staff only)').addAttachmentOption(o => o.setName('image').setDescription('Upload image').setRequired(false)).addStringOption(o => o.setName('url').setDescription('Or paste image URL').setRequired(false)).addStringOption(o => o.setName('caption').setDescription('Short caption').setRequired(false)),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const url = (i.options.getAttachment('image')?.url) || i.options.getString('url');
    if (!url) return i.reply({ embeds: [errorEmbed('Provide an image upload or URL.')], ephemeral: true });
    const items = getSlice('portfolio', i.guild.id, []); items.unshift({ url, caption: i.options.getString('caption')||null, addedBy: i.user.id, addedAt: new Date().toISOString() }); setSlice('portfolio', i.guild.id, items);
    return i.reply({ embeds: [successEmbed('Added! Run `/portfolio` to see it.')] });
  }
};
