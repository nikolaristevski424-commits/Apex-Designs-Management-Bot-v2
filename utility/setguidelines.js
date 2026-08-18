const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { isManager } = require('../../utils/permissions');
const { errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'utility', data: new SlashCommandBuilder().setName('setguidelines').setDescription('Set server guidelines shown in the dashboard panel (managers only)'),
  async execute(i) {
    if (!isManager(i.member)) return i.reply({ embeds: [errorEmbed('Managers only.')], ephemeral: true });
    const modal = new ModalBuilder().setCustomId('set_guidelines_modal').setTitle('Set Server Guidelines');
    modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('guidelines_text').setLabel('Guidelines text (supports markdown)').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(4000)));
    return i.showModal(modal);
  }
};
