const { SlashCommandBuilder } = require('discord.js');
const { getSlice } = require('../../utils/storage');
const { CURRENCY_EMOJI } = require('../../utils/economy');
const { brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'economy', data: new SlashCommandBuilder().setName('richest').setDescription('See the wealthiest members'),
  async execute(i) {
    const all = getSlice('economy', i.guild.id, {});
    const ranked = Object.entries(all).map(([id, a]) => ({ id, net: a.balance + a.bank })).sort((a,b)=>b.net-a.net).slice(0,10);
    if (!ranked.length) return i.reply({ embeds: [brandedEmbed({ title: 'Richest Members', description: 'Nobody has any coins yet!' }).embed] });
    const medals=['🥇','🥈','🥉'];
    const lines = ranked.map((r,idx)=>`${medals[idx]||`${idx+1}.`} <@${r.id}> — ${CURRENCY_EMOJI} ${r.net.toLocaleString()}`);
    const { embed } = brandedEmbed({ title: 'Richest Members', description: lines.join('\n') });
    return i.reply({ embeds: [embed] });
  }
};
