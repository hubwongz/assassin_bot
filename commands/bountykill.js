const { SlashCommandBuilder } = require("discord.js");
const { openDb } = require("./../database_handler.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bountykill")
    .setDescription("Logs a successful bounty.")
    .addUserOption((option) =>
      option
        .setName("killer")
        .setDescription("The killer.")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("killed")
        .setDescription("The bounty you have collected.")
        .setRequired(true)
    ),
  async execute(interaction) {
    let db = await openDb();
    const killer = interaction.options.getUser("killer").id;
    const killed = interaction.options.getUser("killed").id;

    // only abby and hubert can do a bounty kill. ids are abby then hubert.
    const agency = interaction.user.id;
    if (agency == '606339196160049153' || agency == '249389362813468673') {
      //bounty kill:
      //killer + 4, killed - 3
      sql = `SELECT nickname, score FROM users WHERE user_id = ?`;
      killed_score = await db.get(sql, [killed]);
      killed_score["score"] -= 3;
      killer_score = await db.get(sql, [killer]);
      killer_score["score"] += 4;
      sql = `UPDATE users SET score = ? WHERE user_id = ?`;
      await db.run(sql, [killer_score["score"], killer]);
      await db.run(sql, [killed_score["score"], killed]);
      await interaction.reply(
        `Bounty on **${killed}** has been collected by **${killer}**. **${killer}**, you now have ${killed_score["score"]} points. You might be the next bounty. Watch your back.`
      );
    }
    else {
      await interaction.reply(`Contact the agency to log your bounty kill.`);
      return;
    }
  },
};
