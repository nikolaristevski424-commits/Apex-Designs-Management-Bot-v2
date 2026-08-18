const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { BRAND } = require('../../utils/embeds');
const NUM_EMOJI = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'];
module.exports = { category: 'tools', data: new SlashCommandBuilder().setName('poll').setDescription('Create a quick reaction poll')
  .addStringOption(o=>o.setName('question').setDescription('Poll question').setRequired(true))
  .addStringOption(o=>o.setName('option1').setDescription('Option 1').setRequired(true)).addStringOption(o=>o.setName('option2').setDescription('Option 2').setRequired(true))
  .addStringOption(o=>o.setName('option3').setDescription('Option 3').setRequired(false)).addStringOption(o=>o.setName('option4').setDescription('Option 4').setRequired(false)).addStringOption(o=>o.setName('option5').setDescription('Option 5').setRequired(false)),
  async execute(i) {
    const options = [1,2,3,4,5].map(n=>i.options.getString(`option${n}`)).filter(Boolean);
    const desc = options.map((o,idx)=>`${NUM_EMOJI[idx]} ${o}`).join('\n');
    const embed = new EmbedBuilder().setColor(BRAND.red).setTitle(`📊 ${i.options.getString('question')}`).setDescription(desc).setFooter({ text: `Poll by ${i.user.tag}` }).setTimestamp();
    await i.reply({ embeds: [embed] }); const msg = await i.fetchReply();
    for (let idx=0; idx<options.length; idx++) await msg.react(NUM_EMOJI[idx]).catch(()=>{});
  }
};
