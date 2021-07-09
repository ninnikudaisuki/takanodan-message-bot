const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config();
const axios = require('axios');
const moment = require('moment');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
    const now = moment()
    // ダイスチャンネル内の処理
    if (process.env.DICE_CHANNELS.split(' ').indexOf(msg.channel.id) > -1) {
        // rollemのメッセージの処理
        if (msg.author.username === 'rollem') {
            // ダイス状況を取得
            try {
                const response = await axios.get(`https://x1ahmjgsve.execute-api.us-east-1.amazonaws.com/Prod/dice?channelId=${msg.channel.id}`);
                const dice = response.data.body;
                // 開催中か調べる
                console.log(msg.content);
                const res = msg.content.match(/<@!?(\d+)>.?, \n` (\d+) ` ⟵.+/);
                console.log(res);
                if (dice.dateEnded && dice.dateEnded.length > 0 && now.isSameOrBefore(moment(dice.dateEnded))) {
                    const isWin = parseInt(dice.dice) < res[2];
                    if (isWin) {
                        const winner = dice;
                        winner.discordId = res[1];
                        winner.dice = res[2];
                        await axios.put('https://x1ahmjgsve.execute-api.us-east-1.amazonaws.com/Prod/dice', winner);
                        msg.channel.send(`<@${res[1]}>さんが現在トップです！！`);
                    }
                } else {
                    msg.channel.send('ダイスは開催されていません');
                }
            } catch (e) {
                console.log(e)
            }
        }
    }
});

client.login();