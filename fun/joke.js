const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed } = require('../../utils/embeds');
const JOKES = ["Why do programmers prefer dark mode? Because light attracts bugs.", "Why did the designer break up with the font? It had no character.", "I told my computer I needed a break, and now it won't stop sending me KitKats.", "Why do Java developers wear glasses? Because they don't C#.", "There are 10 types of people: those who understand binary, and those who don't.", "Why did the Roblox developer go broke? Too many Robux taxes.", "A designer's favorite exercise? Cropping out the competition."];
module.exports = { category: 'fun', data: new SlashCommandBuilder().setName('joke').setDescription('Get a random joke'),
  async execute(i) { return i.reply({ embeds: [brandedEmbed({ title: '😄 Random Joke', description: JOKES[Math.floor(Math.random()*JOKES.length)] }).embed] }); }
};
