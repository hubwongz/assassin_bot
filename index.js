const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const { openDb } = require("./database_handler.js");

let db;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
  console.log("Ready!");
});

client.on("ready", async () => {
  // database things start
  db = await openDb();
  // create all the tables if they have not yet been created
  const schema = fs.readFileSync("./database/schema.sql").toString();
  const schemaArr = schema.toString().split(");");

  db.getDatabaseInstance().serialize(() => {
    db.run("PRAGMA foreign_keys=OFF;");
    schemaArr.forEach((query) => {
      if (query) {
        query += ");";
        db.run(query).then(async () => {
          let sql = `SELECT user_id FROM users`;
          users = await db.all(sql);
          const sql_users = users.map((member) => member.user_id);
          sql = `INSERT INTO users (user_id, nickname, score) VALUES (?, ?, 0)`;
          const textchannel = client.channels.cache.get("1037090477553500293");
          const memberArray = textchannel.members.map((member) => member);
          for (let member of memberArray) {
            if (
              !sql_users.includes(member.user.id) &&
              member.user.id != "1037077409817694248" &&
              member.user.id != "1011867184118644797"
            ) {
              await db.get(sql, [
                member.user.id,
                member.nickname ? member.nickname : member.user.id,
              ]);
            }
          }
          console.log("Database ready!");
        });
      }
    });
  });
  // database things end
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(token);
