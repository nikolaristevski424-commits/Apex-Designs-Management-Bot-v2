const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { updateConfig } = require('../../utils/guildConfig');
const { isManager } = require('../../utils/permissions');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'birthday', data: new SlashCommandBuilder().setName('setbirthdaychannel').setDescription('Set the channel for birthday announcements (managers only)').addChannelOption(o=>o.setName('channel').setDescription('Announcement channel').addChannelTypes(ChannelType.GuildText).setRequired(true)),
  async execute(i) {
    if (!isManager(i.member)) return i.reply({ embeds: [errorEmbed('Managers only.')], ephemeral: true });
    const channel = i.options.getChannel('channel'); updateConfig(i.guild.id, { birthdayChannelId: channel.id });
    return i.reply({ embeds: [successEmbed(`Birthday announcements will post in ${channel}.`)] });
  }
};
