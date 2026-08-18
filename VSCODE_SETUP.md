# Quick Setup — VS Code

Get the bot running locally in VS Code in about 5 minutes.

## 1. Open the project
Unzip the bot folder somewhere, then in VS Code:
**File → Open Folder…** → select the unzipped `apex-designs-bot` folder.

You should see this in the Explorer sidebar:
```
commands/
events/
utils/
banners/
assets/
data/
index.js
package.json
deploy-commands.js
README.md
```
If `commands/`, `events/`, or `utils/` are missing, you unzipped wrong — go back one level and unzip again (don't zip/unzip a folder inside a folder).

## 2. Install the recommended extension (optional but nice)
Extensions tab (`Ctrl+Shift+X` / `Cmd+Shift+X`) → search **"DotENV"** by mikestead → Install.
This gives `.env` files proper syntax highlighting.

## 3. Open a terminal
`` Ctrl+` `` (backtick) or **Terminal → New Terminal**. Make sure it's pointed at the project folder (VS Code does this automatically).

## 4. Install Node.js dependencies
```bash
npm install
```
This creates a `node_modules/` folder — don't worry if VS Code shows a ton of new files, that's normal, they're already gitignored.

> **No Node.js installed?** Download the LTS version from https://nodejs.org, install it, then **restart VS Code** before running `npm install` (VS Code needs to pick up the new PATH).

## 5. Create your `.env` file
In the Explorer, right-click the root folder → **New File** → name it exactly `.env` (yes, starting with a dot).

Paste this in and fill in your own values:
```env
DISCORD_TOKEN=paste_your_bot_token_here
CLIENT_ID=paste_your_application_id_here
GUILD_ID=paste_your_server_id_here
```

Where to get these:
- **DISCORD_TOKEN** — https://discord.com/developers/applications → your app → **Bot** → Reset Token → copy it. Treat this like a password.
- **CLIENT_ID** — same app → **General Information** → Application ID.
- **GUILD_ID** — in Discord: User Settings → Advanced → enable Developer Mode → right-click your server icon → Copy Server ID. (Keeping this filled in makes slash commands appear instantly while testing; remove the line later to go global.)

`.env` is already in `.gitignore`, so it won't accidentally get committed if you push this to GitHub.

## 6. Register the slash commands
In the same terminal:
```bash
npm run deploy
```
You should see `✅ 97 commands registered to guild ... (instant).` If you see an error instead, double-check `DISCORD_TOKEN` and `CLIENT_ID` in `.env` have no extra spaces or quotes around them.

## 7. Start the bot
```bash
npm start
```
You should see:
```
✅ Loaded 97 commands across 23 categories.
✅ Loaded 12 events.
✅ Apex Designs bot online as YourBotName#0000
```
Leave this terminal running — closing it (or closing VS Code) stops the bot. To stop it manually, click in the terminal and press `Ctrl+C`.

## 8. Run first-time setup in Discord
In your server, run:
```
/setup
```
and fill in your ticket category + staff role (see the main README.md for every option).

---

## Making changes and testing them

- Edit any file in `commands/`, `events/`, or `utils/`, save it, then in the terminal press `Ctrl+C` to stop the bot and run `npm start` again to reload your changes. (Plain `node` doesn't hot-reload.)
- If you **add or rename a slash command**, also re-run `npm run deploy` so Discord picks up the change — editing an existing command's *behavior* doesn't need a redeploy, only adding/removing/renaming commands does.
- **Debugging:** a `.vscode/launch.json` is already included, so `F5` just works — no prompts. It launches **"Start Apex Designs Bot"** by default; open the Run & Debug panel (`Ctrl+Shift+D`) to switch to **"Deploy Slash Commands"** instead when you need to redeploy. Click in the gutter next to any line number to set a breakpoint first.

## Common first-run errors

| Error | Fix |
|---|---|
| `❌ DISCORD_TOKEN is missing from your .env file` | `.env` wasn't created, is misnamed, or is in the wrong folder — it must sit next to `package.json`. |
| `❌ MISSING FOLDERS — the bot cannot start` | You only have some of the project folders — re-unzip the whole thing. |
| `Failed to log in` | Token is wrong/expired — go regenerate it in the Developer Portal and paste the new one. |
| Commands don't show up in Discord | Run `npm run deploy`. If you didn't set `GUILD_ID`, global commands can take up to an hour to appear. |
| `'npm' is not recognized` | Node.js isn't installed, or VS Code was open before you installed it — install from nodejs.org, then fully restart VS Code. |

Full command list and every `/setup` option: see **README.md** in this same folder.
