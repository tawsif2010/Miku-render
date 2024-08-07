const fs = require('fs'); const moment = require('moment-timezone'); module.exports = { config: { name: "info", version: "1.0", countDown: 20, role: 0, shortDescription: { vi: "", en: "" }, longDescription: { vi: "", en: "" }, category: "owner", guide: { en: "" }, envConfig: {} }, onStart: async function ({ message }) { const botName = "[ ! ] • Miku♡"; const botPrefix = "!"; const authorName = "MD Tawsif"; const teamName = "don't have any team"; const authorFB = "https://www.facebook.com/tawsif.uwu"; const authorInsta = "@xx__dark_prince__xx"; const now = moment().tz('Asia/Dhaka'); const date = now.format('MMMM Do YYYY'); const time = now.format('h:mm:ss A'); const uptime = process.uptime(); const seconds = Math.floor(uptime % 60); const minutes = Math.floor((uptime / 60) % 60); const hours = Math.floor((uptime / (60 * 60)) % 24); const days = Math.floor(uptime / (60 * 60 * 24)); const uptimeString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`; message.reply({ body: `《  Bot & Owner Info 》
\Name: ${botName}
\Bot Prefix: ${botPrefix}
\owner: ${authorName}
\Facebook: ${authorFB}
\Instagram: ${authorInsta}
\Date: ${date}
\Time: ${time}
\Team: ${teamName}
\Uptime: ${uptimeString}
\===============`}); }, onChat: async function({ event, message, getLang }) { if (event.body && event.body.toLowerCase() === "info") { this.onStart({ message }); } } };