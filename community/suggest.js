const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getConfig } = require('../../utils/guildConfig');
const { BRAND, successEmbed } = require('../../utils/embeds');
module.exports = { category: 'community', data: new SlashCommandBuilder().setName('suggest').setDescription('Submit a suggestion for the server').addStringOption(o=>o.setName('idea').setDescription('Your suggestion').setRequired(true)),
  async execute(i) {
    const cfg = getConfig(i.guild.id);
    const channel = cfg.suggestionsChannelId ? i.guild.channels.cache.get(cfg.suggestionsChannelId) : i.channel;
    const idea = i.options.getString('idea');
    const embed = new EmbedBuilder().setColor(BRAND.red).setAuthor({ name: i.user.tag, iconURL: i.user.displayAvatarURL() }).setDescription(idea).setFooter({ text: 'React 👍 or 👎 to vote' }).setTimestamp();
    const msg = await channel.send({ embeds: [embed] }); await msg.react('👍'); await msg.react('👎');
    if (channel.id !== i.channel.id) return i.reply({ embeds: [successEmbed(`Suggestion posted in ${channel}!`)], ephemeral: true });
    return i.reply({ embeds: [successEmbed('Suggestion posted!')], ephemeral: true });
  }
};
