const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { openDb } = require("./../database_handler.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scoreboard')
        .setDescription('Shows the current scoreboard.'),
    async execute(interaction) {
        await interaction.deferReply();
        let db = await openDb();
        sql = `SELECT * FROM users`;
        scores = await db.all(sql);
        scores.sort(function (a, b) {
            return b.score - a.score
        });
        const embed = new EmbedBuilder()
            .setTitle('Scores')
            .setDescription('Who gonna win?');
        const obj = { agent: '', score: '' };
        for (let agent of scores) {
            obj.agent += `\n${agent['username']}`;
            obj.score += `\n${agent['score']}`;
        }
        embed.addFields(
            { name: `Agent᲼᲼᲼᲼᲼᲼᲼᲼`, value: obj.agent, inline: true },
            { name: `Score`, value: obj.score, inline: true },
        );
        interaction.editReply({
            embeds: [embed],
        });
        return;
    },
};
