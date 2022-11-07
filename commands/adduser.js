const { SlashCommandBuilder } = require("discord.js");
const { openDb } = require("./../database_handler.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adduser")
    .setDescription("Adds a user to the game.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The person being added.")
        .setRequired(true)
    ),
  async execute(interaction) {
    let db = await openDb();
    const user = interaction.options.getUser("user").id;
    const textchannel = interaction.guild.channels.cache.get(
      "1037090477553500293"
    );
    const memberArray = textchannel.members.map((member) => member.user.id);
    if (!memberArray.includes(user)) {
      await interaction.reply(
        `That user isn't in this channel. Add them first before adding them to the game.`
      );
      return;
    }

    const member = await interaction.guild.members.fetch({
      user: user,
      force: true,
    });

    sql = `SELECT * FROM users WHERE user_id = ?`;
    sql_user = await db.get(sql, [user]);
    if (sql_user) {
      await interaction.reply(
        `That user is already playing! You can't re-add them.`
      );
      return;
    }
    sql = `INSERT INTO users (user_id, nickname, score) VALUES (?, ?, 0)`;
    await db.run(sql, [member.user.id, member.nickname]);

    await interaction.reply(
      `User \`${member.nickname}\` has been added to the game.`
    );
  },
};
