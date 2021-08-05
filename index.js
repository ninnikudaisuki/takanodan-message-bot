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
        
        // コマンドの処理
        if (msg.content === '/close') {
            // ダイスクローズ
            try {
                await axios.delete(`https://r5zkjctgxl.execute-api.ap-northeast-1.amazonaws.com/Prod/dicebot?channelId=${msg.channel.id}`);
                msg.channel.send('クローズしました');
            } catch (e) {
                msg.channel.send('しかし、なにもおこらなかった！');
            }
            return;
        }
        
        // rollemのメッセージの処理
        if (msg.author.username === 'rollem') {
            // ダイス状況を取得
            try {
                const response = await axios.get(`https://r5zkjctgxl.execute-api.ap-northeast-1.amazonaws.com/Prod/dicebot?channelId=${msg.channel.id}`);
                const dice = response.data.body;
                // 開催中か調べる
                const res = msg.content.match(/<@!?(\d+)>.?, \n` (\d+) ` ⟵.+/);
                
                console.log(response)
                console.log(dice);
                
                
                if (dice.dateEnded && dice.dateEnded.length > 0 && now.isSameOrBefore(moment(dice.dateEnded))) {
                    let isWin;
                    try {
                        const oldDice = parseInt(dice.dice);
                        isWin = oldDice ? oldDice < res[2] : true;
                    } catch (e) {
                        isWin = true
                    }
                    console.log(isWin);
                    try {
                        if (isWin) {
                            const winner = dice;
                            winner.discordId = res[1];
                            winner.dice = res[2];
                            await axios.put('https://r5zkjctgxl.execute-api.ap-northeast-1.amazonaws.com/Prod/dicebot', winner);
                            msg.channel.send(`<@${res[1]}>さんが現在トップです！！`);
                        }
                    } catch (e) {
                        console.log(e);
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