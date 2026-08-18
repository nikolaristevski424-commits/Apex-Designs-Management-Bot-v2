require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const cmdDir = path.join(__dirname, 'commands');
for (const folder of fs.readdirSync(cmdDir)) {
  const folderPath = path.join(cmdDir, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(folderPath, file));
    if (cmd?.data) commands.push(cmd.data.toJSON());
  }
}

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) { console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID'); process.exit(1); }
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
(async () => {
  try {
    console.log(`Deploying ${commands.length} commands…`);
    if (process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
      console.log(`✅ ${commands.length} commands registered to guild ${process.env.GUILD_ID} (instant).`);
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log(`✅ ${commands.length} global commands registered (up to 1 hour to appear).`);
    }
  } catch (e) { console.error('❌ Deploy failed:', e); }
})();
