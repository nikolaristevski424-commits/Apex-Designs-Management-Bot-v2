const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');
module.exports = { category: 'tools', data: new SlashCommandBuilder().setName('generatepassword').setDescription('Generate a random secure password (sent privately)').addIntegerOption(o=>o.setName('length').setDescription('Length (8-64)').setMinValue(8).setMaxValue(64).setRequired(false)),
  async execute(i) {
    const length = i.options.getInteger('length') || 16;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let pw = ''; const bytes = crypto.randomBytes(length);
    for (let idx = 0; idx < length; idx++) pw += chars[bytes[idx] % chars.length];
    return i.reply({ content: `🔑 Your generated password: \`${pw}\`\n-# This message is only visible to you.`, ephemeral: true });
  }
};
