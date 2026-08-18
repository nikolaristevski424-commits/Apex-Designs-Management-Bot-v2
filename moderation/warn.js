const { SlashCommandBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { getConfig } = require('../../utils/guildConfig');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'moderation', data: new SlashCommandBuilder().setName('warn').setDescription('Warn a member (staff only)').addUserOption(o=>o.setName('user').setDescription('User to warn').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(true)),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const user = i.options.getUser('user'); const reason = i.options.getString('reason');
    if (user.id === i.user.id) return i.reply({ embeds: [errorEmbed('You cannot warn yourself.')], ephemeral: true });
    const warnings = getSlice('warnings', i.guild.id, {});
    if (!warnings[user.id]) warnings[user.id] = [];
    warnings[user.id].push({ reason, staffId: i.user.id, at: new Date().toISOString() });
    setSlice('warnings', i.guild.id, warnings);
    const { embed, files } = brandedEmbed({ title: '⚠️ Member Warned', fields: [{ name: 'User', value: `${user}`, inline: true }, { name: 'Total Warnings', value: String(warnings[user.id].length), inline: true }, { name: 'Reason', value: reason }] });
    await i.reply({ embeds: [embed], files });
    await user.send({ embeds: [brandedEmbed({ title: 'You were warned in ' + i.guild.name, description: reason }).embed] }).catch(() => {});
    const cfg = getConfig(i.guild.id);
    if (cfg.modLogChannelId) i.guild.channels.cache.get(cfg.modLogChannelId)?.send({ embeds: [embed], files }).catch(() => {});
  }
};
