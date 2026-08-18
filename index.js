// index.js - Apex Designs Bot
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');

const REQUIRED_DIRS = ['commands', 'events', 'utils', 'banners', 'data'];
const missing = REQUIRED_DIRS.filter(d => !fs.existsSync(path.join(__dirname, d)));
if (missing.length) {
  console.error('\n❌ MISSING FOLDERS — the bot cannot start.\n');
  console.error('   These folders are not on the server:');
  missing.forEach(d => console.error(`     • ${d}/`));
  console.error('\n   Upload the FULL project (all folders), not just the root files.\n');
  process.exit(1);
}
if (!process.env.DISCORD_TOKEN) { console.error('\n❌ DISCORD_TOKEN is missing from your .env file.\n'); process.exit(1); }
if (!process.env.CLIENT_ID) { console.error('\n❌ CLIENT_ID is missing from your .env file.\n'); process.exit(1); }
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildModeration],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

client.commands = new Collection();
const cmdDir = path.join(__dirname, 'commands');
let cmdCount = 0;
for (const folder of fs.readdirSync(cmdDir)) {
  const folderPath = path.join(cmdDir, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
    try {
      const cmd = require(path.join(folderPath, file));
      if (!cmd?.data?.name) { console.warn(`⚠️  Skipped ${folder}/${file} — missing data.name`); continue; }
      client.commands.set(cmd.data.name, cmd); cmdCount++;
    } catch (err) { console.error(`❌ Failed to load ${folder}/${file}:`, err.message); }
  }
}
console.log(`✅ Loaded ${cmdCount} commands across ${fs.readdirSync(cmdDir).filter(f => fs.statSync(path.join(cmdDir, f)).isDirectory()).length} categories.`);

const evtDir = path.join(__dirname, 'events');
let evtCount = 0;
for (const file of fs.readdirSync(evtDir).filter(f => f.endsWith('.js'))) {
  try {
    const evt = require(path.join(evtDir, file));
    evt.once ? client.once(evt.name, (...a) => evt.execute(...a)) : client.on(evt.name, (...a) => evt.execute(...a));
    evtCount++;
  } catch (err) { console.error(`❌ Failed to load event ${file}:`, err.message); }
}
console.log(`✅ Loaded ${evtCount} events.`);

// ── periodic sweeps ──────────────────────────────────────────────────────────
// Giveaway auto-end check (every 30s)
setInterval(async () => {
  const { getSlice, setSlice } = require('./utils/storage');
  const { pickWinners } = require('./commands/giveaway/giveaway');
  for (const guild of client.guilds.cache.values()) {
    const giveaways = getSlice('giveaways', guild.id, {});
    for (const [msgId, g] of Object.entries(giveaways)) {
      if (g.ended || g.endsAt > Date.now()) continue;
      g.ended = true;
      const channel = guild.channels.cache.get(g.channelId);
      try {
        const winners = await pickWinners(guild, g, g.winnerCount);
        if (!winners.length) await channel?.send(`No valid entries for the **${g.prize}** giveaway.`);
        else await channel?.send(`🎉 Congrats ${winners.map(w => `${w}`).join(', ')}! You won **${g.prize}**!`);
      } catch (e) { console.error('[giveaway sweep]', e); }
    }
    setSlice('giveaways', guild.id, giveaways);
  }
}, 30000);

// Server stats channel name refresh (every 10 min)
setInterval(() => {
  const { getSlice } = require('./utils/storage');
  for (const guild of client.guilds.cache.values()) {
    const stats = getSlice('server_stats', guild.id, {});
    if (!stats.channels) continue;
    const members = guild.channels.cache.get(stats.channels.members);
    const boosts = guild.channels.cache.get(stats.channels.boosts);
    members?.setName(`Members: ${guild.memberCount}`).catch(() => {});
    boosts?.setName(`Boosts: ${guild.premiumSubscriptionCount || 0}`).catch(() => {});
  }
}, 600000);

// Birthday announcement check (every hour)
setInterval(() => {
  const { getSlice, setSlice } = require('./utils/storage');
  const { getConfig } = require('./utils/guildConfig');
  const now = new Date();
  for (const guild of client.guilds.cache.values()) {
    const cfg = getConfig(guild.id);
    if (!cfg.birthdayChannelId) continue;
    const channel = guild.channels.cache.get(cfg.birthdayChannelId);
    if (!channel) continue;
    const bdays = getSlice('birthdays', guild.id, {});
    const todayKey = `${now.getMonth() + 1}-${now.getDate()}`;
    let changed = false;
    for (const [userId, b] of Object.entries(bdays)) {
      if (`${b.month}-${b.day}` !== todayKey) continue;
      if (b.lastAnnounced === now.toDateString()) continue;
      channel.send(`🎂 Happy Birthday <@${userId}>! Hope you have an amazing day!`).catch(() => {});
      b.lastAnnounced = now.toDateString(); changed = true;
    }
    if (changed) setSlice('birthdays', guild.id, bdays);
  }
}, 3600000);

process.on('unhandledRejection', err => console.error('⚠️  Unhandled promise rejection:', err));

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('\n❌ Failed to log in. Check your DISCORD_TOKEN in .env\n', err.message);
  process.exit(1);
});
