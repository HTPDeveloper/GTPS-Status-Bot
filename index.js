const { Client, Intents, MessageEmbed } = require('discord.js');
const fs = require('fs');
const { exec } = require('child_process');
const lineReader = require('line-reader');
const randomColor = require('randomcolor');

const config = require("./botconfig.json");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const isRunning = (query, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32': cmd = `tasklist`; break;
        case 'darwin': cmd = `ps -ax | grep ${query}`; break;
        case 'linux': cmd = `ps -A`; break;
        default: break;
    }
    exec(cmd, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
    });
}

client.on('ready', () => {
    console.log(`${client.user.tag} Now Is Online!`)
    client.user.setActivity('GT Private Server | Server Status', { type: 'WATCHING' });

    const statusz = new MessageEmbed()
        .setColor('#ff0000') // Default 
        .setAuthor(`${client.user.username}`)
        .addField('*Server Status:**', '**DOWN**')
        .addField('Players Online:', 'Please wait.')
        .setTimestamp()
        .setFooter('Last Updated');

    client.channels.cache.get(config.channel).send({ embeds: [statusz] }).then((msg) => {
        setInterval(() => {
            const color = randomColor();
            isRunning(config.exe_name, (status) => {
                if (status == true) {
                    lineReader.eachLine('onlineplayer.txt', function (line) {
                        const f1 = fs.readdirSync(config.player).length;
                        const f2 = fs.readdirSync(config.world).length;
                        const f3 = fs.readdirSync(config.guild).length;

                        const statuszz = new MessageEmbed()
                            .setColor(color)
                            .setAuthor(`${msg.guild.name}`, msg.guild.iconURL())
                            .addField('**Server Status:**', '**UP**')
                            .addField(`**Players Online:** ${line}`)
                            .addField(`**Players File Count: ** ${f1}`, true)
                            .addField(`**Worlds File Count: ** ${f2}`, true)
                            .addField(`**Guilds File Count: ** ${f3}`, true)
                            .setTimestamp()
                            .setFooter('Last Updated');

                        msg.edit({ embeds: [statuszz] });
                    });
                } else {
                    const f1 = fs.readdirSync(config.player).length;
                    const f2 = fs.readdirSync(config.world).length;
                    const f3 = fs.readdirSync(config.guild).length;

                    const statusz = new MessageEmbed()
                        .setColor(color)
                        .setAuthor(`${msg.guild.name}`, msg.guild.iconURL())
                        .addField('**Server Status:**', '**DOWN**')
                        .addField(`**Players online:** '0'`, true)
                        .addField(`**Players File Count: ** ${f1}`, true)
                        .addField(`**Worlds File Count: ** ${f2}`, true)
                        .addField(`**Guilds File Count: ** ${f3}`, true)
                        .setTimestamp()
                        .setFooter('Last Updated');

                    msg.edit({ embeds: [statusz] });
                }
            })
        }, 3000);
    });
});

client.login(config.token);
