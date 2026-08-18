const { SlashCommandBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { brandedEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'roblox', data: new SlashCommandBuilder().setName('verify').setDescription('Link your Discord account to your Roblox username').addStringOption(o => o.setName('username').setDescription('Your Roblox username').setRequired(true)),
  async execute(i) {
    const username = i.options.getString('username').trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return i.reply({ embeds: [errorEmbed('Invalid Roblox username. Must be 3–20 characters, letters/numbers/underscores only.')], ephemeral: true });
    const profiles = getSlice('roblox_profiles', i.guild.id, {});
    profiles[i.user.id] = { robloxUsername: username, verifiedAt: new Date().toISOString() };
    setSlice('roblox_profiles', i.guild.id, profiles);
    return i.reply({ embeds: [brandedEmbed({ title: '✅ Roblox Account Linked', description: `Your Discord is now linked to Roblox username **${username}**.`, fields: [{ name: 'Discord', value: i.user.tag, inline: true }, { name: 'Roblox', value: username, inline: true }] }).embed], ephemeral: true });
  }
};
