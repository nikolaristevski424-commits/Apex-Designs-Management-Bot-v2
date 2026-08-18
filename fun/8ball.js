const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed } = require('../../utils/embeds');
const ANSWERS = ['It is certain.', 'Without a doubt.', 'Yes, definitely.', 'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.', "Don't count on it.", 'My reply is no.', 'My sources say no.', 'Outlook not so good.', 'Very doubtful.'];
module.exports = { category: 'fun', data: new SlashCommandBuilder().setName('8ball').setDescription('Ask the magic 8-ball a question').addStringOption(o=>o.setName('question').setDescription('Your question').setRequired(true)),
  async execute(i) {
    const q = i.options.getString('question'); const answer = ANSWERS[Math.floor(Math.random()*ANSWERS.length)];
    const { embed } = brandedEmbed({ title: '🎱 Magic 8-Ball', fields: [{ name: 'Question', value: q }, { name: 'Answer', value: answer }] });
    return i.reply({ embeds: [embed] });
  }
};
