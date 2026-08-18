const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { isManager } = require('../../utils/permissions');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = {
  category: 'serverstats',
  data: new SlashCommandBuilder().setName('serverstats').setDescription('Create live-updating server stat channels (managers only)'),
  async execute(i) {
    if (!isManager(i.member)) return i.reply({ embeds: [errorEmbed('Managers only.')], ephemeral: true });
    await i.deferReply({ ephemeral: true });
    const category = await i.guild.channels.create({ name: '📊 Server Stats', type: ChannelType.GuildCategory });
    const everyone = i.guild.roles.everyone;
    const opts = { parent: category.id, permissionOverwrites: [{ id: everyone.id, deny: [PermissionFlagsBits.Connect], allow: [PermissionFlagsBits.ViewChannel] }] };
    const members = await i.guild.channels.create({ name: `Members: ${i.guild.memberCount}`, type: ChannelType.GuildVoice, ...opts });
    const boosts = await i.guild.channels.create({ name: `Boosts: ${i.guild.premiumSubscriptionCount || 0}`, type: ChannelType.GuildVoice, ...opts });
    const stats = getSlice('server_stats', i.guild.id, {}); stats.categoryId = category.id; stats.channels = { members: members.id, boosts: boosts.id }; setSlice('server_stats', i.guild.id, stats);
    return i.editReply({ embeds: [successEmbed('Server stat channels created! They refresh automatically every 10 minutes.')] });
  },
};
