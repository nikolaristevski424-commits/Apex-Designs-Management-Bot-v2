const { SlashCommandBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { getConfig } = require('../../utils/guildConfig');
const { isManager } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'staff', data: new SlashCommandBuilder().setName('addstaff').setDescription('Add a user as Apex Designs staff (managers only)').addUserOption(o=>o.setName('user').setDescription('User to add').setRequired(true)),
  async execute(i) {
    if (!isManager(i.member)) return i.reply({ embeds: [errorEmbed('Managers only.')], ephemeral: true });
    const user = i.options.getUser('user'); const sd = getSlice('staff', i.guild.id, { staffIds:[], stats:{} });
    if (!sd.staffIds.includes(user.id)) sd.staffIds.push(user.id);
    if (!sd.stats[user.id]) sd.stats[user.id] = { claimed:0, completed:0 };
    setSlice('staff', i.guild.id, sd);
    const cfg = getConfig(i.guild.id);
    if (cfg.staffRoleId) { const m = await i.guild.members.fetch(user.id).catch(()=>null); if (m) await m.roles.add(cfg.staffRoleId).catch(()=>{}); }
    return i.reply({ embeds: [successEmbed(`${user} is now Apex Designs staff.`)] });
  }
};
