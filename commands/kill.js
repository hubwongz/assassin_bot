const { SlashCommandBuilder } = require("discord.js");
const { openDb } = require("./../database_handler.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Logs a kill.")
    .addUserOption((option) =>
      option
        .setName("killed")
        .setDescription("The person you killed.")
        .setRequired(true)
    ),
  async execute(interaction) {
    let db = await openDb();
    const killed = interaction.options.getUser("killed").id;
    const textchannel = interaction.guild.channels.cache.get(
      "1037090477553500293"
    );
    const memberArray = textchannel.members.map((member) => member.user.id);
    if (!memberArray.includes(killed)) {
      await interaction.reply(
        `Agent, please stay focused. You just killed a civilian.`
      );
      return;
    }
    const killer = interaction.user.id;
    if (killed == killer) {
      await interaction.reply(`Did you just try to kill yourself agent?`);
      return;
    }
    // gets the scores from all the killer and killed. updates accordingly
    // killer +2 and killed -1

    sql = `SELECT nickname, score FROM users WHERE user_id = ?`;
    killed_score = await db.get(sql, [killed]);
    killed_score["score"] -= 1;
    killer_score = await db.get(sql, [killer]);
    killer_score["score"] += 2;
    sql = `UPDATE users SET score = ? WHERE user_id = ?`;
    await db.run(sql, [killer_score["score"], killer]);
    await db.run(sql, [killed_score["score"], killed]);
    await interaction.reply(
      `You have successfully reported you killed **${killed_score["nickname"]}**. You now have ${killer_score["score"]} points. Watch your back, agent.`
    );
  },
};
