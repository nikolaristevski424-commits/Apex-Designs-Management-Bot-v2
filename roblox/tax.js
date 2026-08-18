const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed } = require('../../utils/embeds');
const ROBLOX_TAX = 0.30;
module.exports = { category: 'roblox', data: new SlashCommandBuilder().setName('tax').setDescription('Roblox tax calculator — figure out what to charge so you receive the right amount')
  .addSubcommand(sub => sub.setName('receive').setDescription('How much must the customer pay so I receive X Robux?').addIntegerOption(o => o.setName('amount').setDescription('Robux you want to RECEIVE (after Roblox takes 30%)').setRequired(true).setMinValue(1)))
  .addSubcommand(sub => sub.setName('charge').setDescription('If customer pays X Robux, how much will I receive?').addIntegerOption(o => o.setName('amount').setDescription('Robux the customer will PAY').setRequired(true).setMinValue(1))),
  async execute(i) {
    const sub = i.options.getSubcommand(); const amount = i.options.getInteger('amount');
    let beforeTax, afterTax, taxAmount;
    if (sub === 'receive') { afterTax = amount; beforeTax = Math.ceil(amount / (1 - ROBLOX_TAX)); taxAmount = beforeTax - afterTax; }
    else { beforeTax = amount; afterTax = Math.floor(amount * (1 - ROBLOX_TAX)); taxAmount = beforeTax - afterTax; }
    const { embed, files } = brandedEmbed({ title: '🎮 Roblox Tax Calculator', description: [
      `**Input:** \`${beforeTax.toLocaleString()}\` Robux *(customer pays)*`, `**Tax (30%):** \`${taxAmount.toLocaleString()}\` Robux *(Roblox keeps)*`, `**Output:** \`${afterTax.toLocaleString()}\` Robux *(you receive)*`, ``,
      `-# Set your gamepass price to **${beforeTax.toLocaleString()} Robux** so you receive **${afterTax.toLocaleString()} Robux** after Roblox's 30% fee.`,
    ].join('\n') });
    return i.reply({ embeds: [embed], files, ephemeral: true });
  }
};
