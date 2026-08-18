const { SlashCommandBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
module.exports = { category: 'birthday', data: new SlashCommandBuilder().setName('setbirthday').setDescription('Set your birthday (month + day only, no year) for server announcements').addIntegerOption(o=>o.setName('month').setDescription('Month (1-12)').setRequired(true).setMinValue(1).setMaxValue(12)).addIntegerOption(o=>o.setName('day').setDescription('Day (1-31)').setRequired(true).setMinValue(1).setMaxValue(31)),
  async execute(i) {
    const month = i.options.getInteger('month'); const day = i.options.getInteger('day');
    const daysInMonth = new Date(2024, month, 0).getDate();
    if (day > daysInMonth) return i.reply({ embeds: [errorEmbed(`${MONTHS[month-1]} only has ${daysInMonth} days.`)], ephemeral: true });
    const bdays = getSlice('birthdays', i.guild.id, {}); bdays[i.user.id] = { month, day, lastAnnounced: null }; setSlice('birthdays', i.guild.id, bdays);
    return i.reply({ embeds: [successEmbed(`Birthday set to **${MONTHS[month-1]} ${day}**. We'll announce it every year!`)], ephemeral: true });
  }
};
