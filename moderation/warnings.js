const { SlashCommandBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, brandedEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'moderation', data: new SlashCommandBuilder().setName('warnings').setDescription("View or clear a member's warnings (staff only)").addUserOption(o=>o.setName('user').setDescription('User').setRequired(true)).addBooleanOption(o=>o.setName('clear').setDescription('Clear all warnings for this user').setRequired(false)),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const user = i.options.getUser('user');
    const warnings = getSlice('warnings', i.guild.id, {});
    if (i.options.getBoolean('clear')) { warnings[user.id] = []; setSlice('warnings', i.guild.id, warnings); return i.reply({ embeds: [successEmbed(`Cleared all warnings for ${user}.`)] }); }
    const list = warnings[user.id] || [];
    if (!list.length) return i.reply({ embeds: [brandedEmbed({ title: `${user.username}'s Warnings`, description: 'No warnings on record.' }).embed], ephemeral: true });
    const lines = list.map((w, idx) => `**${idx+1}.** ${w.reason} — <@${w.staffId}> — <t:${Math.floor(new Date(w.at).getTime()/1000)}:R>`);
    const { embed, files } = brandedEmbed({ title: `${user.username}'s Warnings (${list.length})`, description: lines.join('\n').slice(0,4000) });
    return i.reply({ embeds: [embed], files, ephemeral: true });
  }
};
