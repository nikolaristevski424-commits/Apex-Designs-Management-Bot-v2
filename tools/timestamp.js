const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed } = require('../../utils/embeds');
module.exports = { category: 'tools', data: new SlashCommandBuilder().setName('timestamp').setDescription('Generate a Discord timestamp from a relative time').addIntegerOption(o=>o.setName('minutes_from_now').setDescription('Minutes from now (negative for past)').setRequired(true)),
  async execute(i) {
    const mins = i.options.getInteger('minutes_from_now'); const unix = Math.floor(Date.now()/1000) + mins*60;
    const styles = ['t','T','d','D','f','F','R']; const labels = ['Short Time','Long Time','Short Date','Long Date','Short Date/Time','Long Date/Time','Relative'];
    const lines = styles.map((s,idx)=>`**${labels[idx]}:** \`<t:${unix}:${s}>\` → <t:${unix}:${s}>`);
    return i.reply({ embeds: [brandedEmbed({ title: 'Discord Timestamp Generator', description: lines.join('\n') }).embed], ephemeral: true });
  }
};
