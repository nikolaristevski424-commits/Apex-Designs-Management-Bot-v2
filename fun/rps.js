const { SlashCommandBuilder } = require('discord.js');
const { brandedEmbed } = require('../../utils/embeds');
const CHOICES = ['rock','paper','scissors']; const EMOJI = { rock: '🪨', paper: '📄', scissors: '✂️' };
function beats(a,b){ return (a==='rock'&&b==='scissors')||(a==='paper'&&b==='rock')||(a==='scissors'&&b==='paper'); }
module.exports = { category: 'fun', data: new SlashCommandBuilder().setName('rps').setDescription('Play rock-paper-scissors against the bot').addStringOption(o=>o.setName('choice').setDescription('Your choice').setRequired(true).addChoices({name:'Rock',value:'rock'},{name:'Paper',value:'paper'},{name:'Scissors',value:'scissors'})),
  async execute(i) {
    const user = i.options.getString('choice'); const bot = CHOICES[Math.floor(Math.random()*3)];
    let result = "It's a tie!"; if (beats(user,bot)) result = 'You win! 🎉'; else if (beats(bot,user)) result = 'I win! 😎';
    const { embed } = brandedEmbed({ title: 'Rock Paper Scissors', description: `You: ${EMOJI[user]} ${user}\nMe: ${EMOJI[bot]} ${bot}\n\n**${result}**` });
    return i.reply({ embeds: [embed] });
  }
};
