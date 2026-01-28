require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// === DISCORD BOT ===
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

let kanalIP = null; // ID kanału do wysyłania IP

discordClient.once('ready', () => {
  console.log(`Bot zalogowany jako ${discordClient.user.tag}`);

  // Rejestracja komendy /kanal (zrób raz, potem możesz zakomentować)
  const commands = [
    new SlashCommandBuilder()
      .setName('kanal')
      .setDescription('Ustaw kanał na logi IP')
      .addChannelOption(opt => opt.setName('kanał').setDescription('Kanał tekstowy').setRequired(true))
  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
    .then(() => console.log('Komenda /kanal zarejestrowana'))
    .catch(err => console.error('Błąd rejestracji komendy:', err));
});

discordClient.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'kanal') {
    const channel = interaction.options.getChannel('kanał');
    if (channel.type !== 0) return interaction.reply({ content: 'Tylko kanały tekstowe!', ephemeral: true });

    kanalIP = channel.id;
    await interaction.reply(`Kanał IP ustawiony na <#${channel.id}>`);
  }
});

discordClient.login(process.env.DISCORD_TOKEN).catch(err => console.error('Błąd logowania bota:', err));

// === STRONA ===
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pl">
    <head><meta charset="utf-8"><title>Logowanie</title></head>
    <body>
      <h1>Zaloguj się</h1>
      <form action="/login" method="POST">
        Login: <input type="text" name="username"><br><br>
        Hasło: <input type="password" name="password"><br><br>
        <button type="submit">Zaloguj</button>
      </form>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Proste logowanie – zmień na swoje
  if (username === 'test' && password === 'haslo123') {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'nieznane';
    if (Array.isArray(ip)) ip = ip[0];

    const msg = `${username}: ${ip}`;

    if (kanalIP) {
      const channel = discordClient.channels.cache.get(kanalIP);
      if (channel) channel.send(msg).catch(err => console.error('Błąd wysyłania do Discorda:', err));
    }

    res.send(`<h1>Witaj ${username}!</h1><p>Twoje IP: ${ip}</p>`);
  } else {
    res.send('<h1>Błędny login/hasło</h1>');
  }
});

// Ważne na Render – używa process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});