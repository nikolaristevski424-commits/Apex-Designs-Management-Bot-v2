const { SlashCommandBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { updateConfig } = require('../../utils/guildConfig');
const { isManager } = require('../../utils/permissions');
const { brandedEmbed, successEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'verification', data: new SlashCommandBuilder().setName('setverification').setDescription('Set up a member verification gate (managers only)').addRoleOption(o=>o.setName('role').setDescription('Role to grant on verification').setRequired(true)).addChannelOption(o=>o.setName('channel').setDescription('Channel to post the verify button in').addChannelTypes(ChannelType.GuildText).setRequired(true)),
  async execute(i) {
    if (!isManager(i.member)) return i.reply({ embeds: [errorEmbed('Managers only.')], ephemeral: true });
    const role = i.options.getRole('role'); const channel = i.options.getChannel('channel');
    updateConfig(i.guild.id, { verifiedRoleId: role.id });
    const { embed, files } = brandedEmbed({ bannerKey: 'welcome', title: 'Verify Yourself', description: `Click the button below to verify and gain access to **${i.guild.name}**.` });
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('member_verify').setLabel('Verify').setStyle(ButtonStyle.Success).setEmoji('✅'));
    await channel.send({ embeds: [embed], files, components: [row] });
    return i.reply({ embeds: [successEmbed(`Verification panel posted in ${channel}.`)], ephemeral: true });
  }
};
