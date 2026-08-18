const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { updateConfig } = require('../../utils/guildConfig');
const { isManager } = require('../../utils/permissions');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'jointocreate', data: new SlashCommandBuilder().setName('jointocreate').setDescription('Set up a "Join to Create" hub voice channel (managers only)').addChannelOption(o=>o.setName('hub_channel').setDescription('The voice channel users join to get their own temp channel').addChannelTypes(ChannelType.GuildVoice).setRequired(true)),
  async execute(i) {
    if (!isManager(i.member)) return i.reply({ embeds: [errorEmbed('Managers only.')], ephemeral: true });
    const hub = i.options.getChannel('hub_channel');
    updateConfig(i.guild.id, { jtcHubChannelId: hub.id, jtcCategoryId: hub.parentId || null });
    return i.reply({ embeds: [successEmbed(`Joining ${hub} will now create a personal temp voice channel.`)] });
  }
};
