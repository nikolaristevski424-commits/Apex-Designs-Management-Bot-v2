const { SlashCommandBuilder } = require('discord.js');
const { successEmbed } = require('../../utils/embeds');
module.exports = { category: 'utility', data: new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),
  async execute(i) {
    const sent = await i.reply({ embeds: [successEmbed('Pinging…')], fetchReply: true });
    return i.editReply({ embeds: [successEmbed(`Pong! Latency: **${sent.createdTimestamp-i.createdTimestamp}ms** | API: **${Math.round(i.client.ws.ping)}ms**`)] });
  }
};
