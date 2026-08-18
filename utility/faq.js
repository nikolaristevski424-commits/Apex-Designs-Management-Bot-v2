const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'utility', data: new SlashCommandBuilder().setName('faq').setDescription('Frequently asked questions about Apex Designs'),
  async execute(i) {
    const { embed, files } = brandedEmbed({ bannerKey: 'welcome', title: 'Frequently Asked Questions', fields: [
      { name: 'How do I order?', value: 'Use the Order Panel or run `/order`. A private ticket will be created.' },
      { name: 'How much does it cost?', value: 'Check `/pricelist` or use `/quote` to build a custom estimate.' },
      { name: 'Do you accept Robux?', value: 'Yes! We accept Robux via Roblox gamepasses. Use `/tax` to calculate the correct amount.' },
      { name: 'How does Roblox payment work?', value: 'Your designer will use `/payment-request` to send you a gamepass link. Purchase it to pay.' },
      { name: 'How do I pay?', value: 'Your designer sends an invoice in your ticket. Click the gamepass link to pay through Roblox.' },
      { name: 'Can I get revisions?', value: 'Yes — discuss with your designer in your ticket.' },
      { name: 'How do I leave a review?', value: 'Use `/vouch` once your order is complete.' },
    ] });
    return i.reply({ embeds: [embed], files });
  }
};
