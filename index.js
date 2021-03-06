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
                await msg.channel.send('クローズしました');
            } catch (e) {
                await msg.channel.send('しかし、なにもおこらなかった！');
            }
            return;
        } else if (msg.content === '/clear') {
            // ルームクリア
            const messages = await msg.channel.messages.fetch({limit: 100});
            msg.channel.bulkDelete(messages);
            
            return;
        }
        
        // rollemのメッセージの処理
        if (msg.author.username === 'rollem') {
            // ダイス状況を取得
            try {
                const response = await axios.get(`https://r5zkjctgxl.execute-api.ap-northeast-1.amazonaws.com/Prod/dicebot?channelId=${msg.channel.id}`);
                const dice = response.data;
                // 開催中か調べる
                if (dice.dateEnded && dice.dateEnded.length > 0 && now.isSameOrBefore(moment(dice.dateEnded))) {
                    let isWin;
                    const newDice = msg.content.match(/` (\d+) ` ⟵.+/)[1];
                    const mention = msg.mentions.users.keys().next().value;
                    try {
                        const oldDice = parseInt(dice.dice);
                        isWin = oldDice ? oldDice < newDice : true;
                    } catch (e) {
                        isWin = true
                    }
                    try {
                        if (isWin) {
                            const winner = dice;
                            winner.discordId = mention;
                            winner.dice = newDice;
                            await axios.put('https://r5zkjctgxl.execute-api.ap-northeast-1.amazonaws.com/Prod/dicebot', winner);
                            await msg.channel.send(`<@${mention}>さんが現在トップです！！`);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    await msg.channel.send('ダイスは開催されていません');
                }
            } catch (e) {
                console.log(e)
            }
        }
    }
});

client.login();