require('dotenv').config()
const axios = require('axios')
const Discord = require('discord.js')
const client = new Discord.Client()


const formatCash = n => {
    if (n < 1e3) return n;
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
};

const setAvatar = () => {
    axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${process.env.PREFERRED_CURRENCY}&ids=${process.env.COIN_ID}`).then(res => {
        if (res.data) {
            client.user.setAvatar(res.data[0].image)
        }
    }).catch(err => console.log('Error at api.coingecko.com data:', err))
};

const getPrices = () => {

    axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${process.env.PREFERRED_CURRENCY}&ids=${process.env.COIN_ID}`).then(res => {
        if (res.data) {
            console.log(res.data)
            let currentPrice = res.data[0].current_price || 0 // Default to zero
            currentPrice = currentPrice.toFixed(8)
            const tradingVolume = res.data[0].total_volume || 0 // Default to zero

            client.user.setPresence({
                status: "online",
                game: {
                    name: `24hr vol: $${formatCash(tradingVolume)}`,
                    type: 3
                }
            })

            client.guilds.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString()}`)
            console.log('Updated price to', currentPrice)
        } else
            console.log('Could not load player count data for', process.env.COIN_ID)

    }).catch(err => console.log('Error at api.coingecko.com data:', err))
}

client.on('ready', () => {
    console.log('Logged in as', client.user.tag)
    setAvatar()
    getPrices()
    setInterval(getPrices, Math.max(1, process.env.MC_PING_FREQUENCY || 1) * 60 * 100)
})

client.on('message', (message) => {
    if (message.content.includes('/status')) {
        axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${process.env.PREFERRED_CURRENCY}&ids=${process.env.COIN_ID}`).then(res => {
            if (res.data) {
                let currentPrice = res.data[0].current_price || 0 // Default to zero
                currentPrice = currentPrice.toFixed(8)
                let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
                const tradingVolume = res.data[0].total_volume || 0 // Default to zero
                message.reply(`$${currentPrice} | ${priceChange.toFixed(2)}% | 24hr/volume: $${formatCash(tradingVolume)}`);
            }
        }).catch(err => console.log('Error at api.coingecko.com data:', err))
    }
});

client.login(process.env.DISCORD_TOKEN)