const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = { category: 'tools', data: new SlashCommandBuilder().setName('calculate').setDescription('Evaluate a math expression').addStringOption(o=>o.setName('expression').setDescription('e.g. (12+8)*3/2').setRequired(true)),
  async execute(i) {
    const expr = i.options.getString('expression');
    if (!/^[0-9+\-*/().\s%^]+$/.test(expr)) return i.reply({ embeds: [errorEmbed('Only numbers and + - * / % ^ ( ) are allowed.')], ephemeral: true });
    try {
      const sanitized = expr.replace(/\^/g, '**');
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result !== 'number' || !isFinite(result)) throw new Error('bad result');
      return i.reply({ embeds: [brandedEmbed({ title: '🧮 Calculator', fields: [{ name: 'Expression', value: `\`${expr}\`` }, { name: 'Result', value: `\`${result}\`` }] }).embed] });
    } catch { return i.reply({ embeds: [errorEmbed('Could not evaluate that expression.')], ephemeral: true }); }
  }
};
