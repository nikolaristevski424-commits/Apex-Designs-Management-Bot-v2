const { SlashCommandBuilder } = require('discord.js');
const { getSlice } = require('../../utils/storage');
const { brandedEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'roblox', data: new SlashCommandBuilder().setName('whois').setDescription("Look up a user's linked Roblox username").addUserOption(o=>o.setName('user').setDescription('Discord user').setRequired(false)),
  async execute(i) {
    const target = i.options.getUser('user')||i.user;
    const profiles = getSlice('roblox_profiles', i.guild.id, {});
    const profile = profiles[target.id];
    if (!profile) return i.reply({ embeds: [errorEmbed(`${target.username} has not linked a Roblox account yet. They can use \`/verify\`.`)], ephemeral: true });
    const { embed } = brandedEmbed({ title: `🎮 ${target.username}'s Roblox Profile`, fields: [{ name: 'Discord', value: target.tag, inline:true }, { name: 'Roblox Username', value: profile.robloxUsername, inline:true }, { name: 'Linked', value: `<t:${Math.floor(new Date(profile.verifiedAt).getTime()/1000)}:R>`, inline:true }] });
    return i.reply({ embeds: [embed], ephemeral: true });
  }
};
