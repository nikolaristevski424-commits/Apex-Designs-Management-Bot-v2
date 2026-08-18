const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getSlice } = require('../../utils/storage');
const { brandedEmbed, BRAND } = require('../../utils/embeds');
const PS = 4;
function buildPage(items, page) {
  const start = page * PS; const slice = items.slice(start, start + PS);
  const { embed: header, files } = brandedEmbed({ bannerKey: 'portfolio', title: 'Apex Designs — Portfolio', description: slice.length ? `Showing ${start+1}–${start+slice.length} of ${items.length} pieces.` : 'No portfolio items yet.' });
  const embeds = [header];
  slice.forEach(item => { const e = new EmbedBuilder().setColor(BRAND.red).setImage(item.url); if (item.caption) e.setDescription(item.caption); embeds.push(e); });
  const total = Math.max(1, Math.ceil(items.length / PS));
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`portfolio_page_${page-1}`).setLabel('◀ Prev').setStyle(ButtonStyle.Secondary).setDisabled(page<=0),
    new ButtonBuilder().setCustomId(`portfolio_page_${page+1}`).setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(page+1>=total));
  return { embeds, files, components: [row] };
}
module.exports = { category: 'portfolio', buildPage, data: new SlashCommandBuilder().setName('portfolio').setDescription('Browse past Apex Designs work'),
  async execute(i) { return i.reply(buildPage(getSlice('portfolio', i.guild.id, []), 0)); }
};
