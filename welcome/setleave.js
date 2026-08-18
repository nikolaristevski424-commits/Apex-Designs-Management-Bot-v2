const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { updateConfig } = require('../../utils/guildConfig');
const { isManager } = require('../../utils/permissions');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'welcome', data: new SlashCommandBuilder().setName('setleave').setDescription('Configure the leave message (managers only)').addChannelOption(o=>o.setName('channel').setDescription('Leave channel').addChannelTypes(ChannelType.GuildText).setRequired(true)).addStringOption(o=>o.setName('message').setDescription('Use {user} and {server} as placeholders').setRequired(false)),
  async execute(i) {
    if (!isManager(i.member)) return i.reply({ embeds: [errorEmbed('Managers only.')], ephemeral: true });
    const channel = i.options.getChannel('channel'); const message = i.options.getString('message') || '{user} has left {server}.';
    updateConfig(i.guild.id, { leaveChannelId: channel.id, leaveMessage: message });
    return i.reply({ embeds: [successEmbed(`Leave messages will post in ${channel}.`)] });
  }
};
