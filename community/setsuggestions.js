const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { updateConfig } = require('../../utils/guildConfig');
const { isManager } = require('../../utils/permissions');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'community', data: new SlashCommandBuilder().setName('setsuggestions').setDescription('Set the suggestions channel (managers only)').addChannelOption(o=>o.setName('channel').setDescription('Channel').addChannelTypes(ChannelType.GuildText).setRequired(true)),
  async execute(i) {
    if (!isManager(i.member)) return i.reply({ embeds: [errorEmbed('Managers only.')], ephemeral: true });
    const channel = i.options.getChannel('channel'); updateConfig(i.guild.id, { suggestionsChannelId: channel.id });
    return i.reply({ embeds: [successEmbed(`Suggestions will now post in ${channel}.`)] });
  }
};
