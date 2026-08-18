const { SlashCommandBuilder } = require('discord.js');
const { getSlice, setSlice } = require('../../utils/storage');
const { isManager } = require('../../utils/permissions');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
module.exports = {
  category: 'reactionroles',
  data: new SlashCommandBuilder().setName('reactionrole').setDescription('Manage reaction roles (managers only)')
    .addSubcommand(s => s.setName('add').setDescription('Add a reaction role to a message').addStringOption(o=>o.setName('message_id').setDescription('Message ID to react to').setRequired(true)).addStringOption(o=>o.setName('emoji').setDescription('Emoji to react with').setRequired(true)).addRoleOption(o=>o.setName('role').setDescription('Role to grant').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a reaction role').addStringOption(o=>o.setName('message_id').setDescription('Message ID').setRequired(true)).addStringOption(o=>o.setName('emoji').setDescription('Emoji').setRequired(true))),
  async execute(i) {
    if (!isManager(i.member)) return i.reply({ embeds: [errorEmbed('Managers only.')], ephemeral: true });
    const sub = i.options.getSubcommand(); const messageId = i.options.getString('message_id'); const emoji = i.options.getString('emoji');
    const rrs = getSlice('reaction_roles', i.guild.id, {});
    if (sub === 'add') {
      const role = i.options.getRole('role');
      const msg = await i.channel.messages.fetch(messageId).catch(() => null);
      if (!msg) return i.reply({ embeds: [errorEmbed('Message not found in this channel.')], ephemeral: true });
      await msg.react(emoji).catch(() => null);
      if (!rrs[messageId]) rrs[messageId] = {}; rrs[messageId][emoji] = role.id; setSlice('reaction_roles', i.guild.id, rrs);
      return i.reply({ embeds: [successEmbed(`Reacting with ${emoji} on that message now grants ${role}.`)] });
    }
    if (sub === 'remove') { if (rrs[messageId]) { delete rrs[messageId][emoji]; setSlice('reaction_roles', i.guild.id, rrs); } return i.reply({ embeds: [successEmbed('Reaction role removed.')] }); }
  },
};
