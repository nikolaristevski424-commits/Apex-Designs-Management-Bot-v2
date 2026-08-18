const { SlashCommandBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { isManager } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'leveling', data: new SlashCommandBuilder().setName('setlevelrole').setDescription('Auto-assign a role when a member reaches a level (managers only)').addIntegerOption(o=>o.setName('level').setDescription('Level required').setRequired(true).setMinValue(1)).addRoleOption(o=>o.setName('role').setDescription('Role to grant').setRequired(true)),
  async execute(i) {
    if (!isManager(i.member)) return i.reply({ embeds: [errorEmbed('Managers only.')], ephemeral: true });
    const level = i.options.getInteger('level'); const role = i.options.getRole('role');
    const roles = getSlice('level_roles', i.guild.id, {}); roles[level] = role.id; setSlice('level_roles', i.guild.id, roles);
    return i.reply({ embeds: [successEmbed(`Members reaching level **${level}** will now get ${role}.`)] });
  }
};
