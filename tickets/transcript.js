const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getTicket } = require('../../utils/tickets');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { buildTranscript } = require('./close');
module.exports = { category: 'tickets', data: new SlashCommandBuilder().setName('transcript').setDescription('Generate a transcript without closing the ticket (staff only)'),
  async execute(i) {
    if (!isStaff(i.member)) return i.reply({ embeds: [errorEmbed('Staff only.')], ephemeral: true });
    const t = getTicket(i.guild.id, i.channel.id);
    if (!t) return i.reply({ embeds: [errorEmbed('Not a ticket channel.')], ephemeral: true });
    await i.deferReply({ ephemeral: true });
    const txt = await buildTranscript(i.channel);
    return i.editReply({ embeds: [successEmbed('Transcript generated.')], files: [new AttachmentBuilder(Buffer.from(txt, 'utf8'), { name: `transcript-${t.ticketNumber}.txt` })] });
  }
};
