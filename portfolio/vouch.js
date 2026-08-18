const { SlashCommandBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { getConfig } = require('../../utils/guildConfig');
const { brandedEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'portfolio', data: new SlashCommandBuilder().setName('vouch').setDescription('Leave a review for a designer').addUserOption(o => o.setName('designer').setDescription('Designer').setRequired(true)).addIntegerOption(o => o.setName('rating').setDescription('Rating 1–5').setRequired(true).setMinValue(1).setMaxValue(5)).addStringOption(o => o.setName('comment').setDescription('Your comment').setRequired(true)),
  async execute(i) {
    const designer = i.options.getUser('designer'); const rating = i.options.getInteger('rating'); const comment = i.options.getString('comment');
    if (designer.id === i.user.id) return i.reply({ embeds: [errorEmbed('Cannot vouch for yourself.')], ephemeral: true });
    const vouches = getSlice('vouches', i.guild.id, {});
    if (!vouches[designer.id]) vouches[designer.id] = { count: 0, totalRating: 0, entries: [] };
    vouches[designer.id].count++; vouches[designer.id].totalRating += rating;
    vouches[designer.id].entries.unshift({ from: i.user.id, rating, comment, date: new Date().toISOString() });
    vouches[designer.id].entries = vouches[designer.id].entries.slice(0,50);
    setSlice('vouches', i.guild.id, vouches);
    const cfg = getConfig(i.guild.id); const { embed, files } = brandedEmbed({ bannerKey: 'vouch', title: 'New Vouch!', description: `${i.user} vouched for ${designer}`, fields: [{ name: 'Rating', value: '⭐'.repeat(rating)+'☆'.repeat(5-rating), inline: true }, { name: 'Comment', value: comment }] });
    const target = cfg.vouchChannelId ? i.guild.channels.cache.get(cfg.vouchChannelId) : null;
    if (target && target.id !== i.channel.id) { await target.send({ embeds: [embed], files }); return i.reply({ embeds: [brandedEmbed({ description: `✅ Vouch posted in ${target}!` }).embed], ephemeral: true }); }
    return i.reply({ embeds: [embed], files });
  }
};
