const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { openDb } = require("./../database_handler.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("scoreboard")
    .setDescription("Shows the current scoreboard."),
  async execute(interaction) {
    await interaction.deferReply();
    let db = await openDb();
    sql = `SELECT * FROM users`;
    scores = await db.all(sql);
    scores.sort(function (a, b) {
      return b.score - a.score;
    });
    const embed = new EmbedBuilder().setTitle("Scores");

    let description = "Who gonna win?\n";
    description += "```Agent                Score\n";
    description += "--------------------------\n";

    for (let agent of scores) {
      description += `${agent["nickname"]}`;
      for (let i = agent["nickname"].length; i < 21; i++) {
        description += " ";
      }
      description += `${agent["score"]}\n`;
    }
    description += "```";

    embed.setDescription(description);

    interaction.editReply({
      embeds: [embed],
    });
    return;
  },
};
