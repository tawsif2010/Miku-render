const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
    config: {
        name: "marry",
        aliases: ["marry"],
        version: "1.0",
        author: "AceGun",
        countDown: 5,
        role: 0,
        shortDescription: "get a wife",
        longDescription: "",
        category: "marry",
        guide: "{pn}"
    },

    onStart: async function ({ message, event, args }) {
        const mention = Object.keys(event.mentions);
        let one, two;

        if (mention.length == 0 && args.length == 0) {
            return message.reply("Please mention someone or provide a UID.");
        } else if (mention.length == 1) {
            one = event.senderID;
            two = mention[0];
        } else if (args.length == 1) {
            one = event.senderID;
            two = args[0];
        } else if (mention.length == 2) {
            one = mention[1];
            two = mention[0];
        } else {
            return message.reply("Invalid number of mentions or arguments.");
        }

        try {
            const imagePath = await bal(one, two);
            message.reply({ body: "「 i love you babe🥰❤️ 」", attachment: fs.createReadStream(imagePath) });
        } catch (error) {
            message.reply("An error occurred while processing the images.");
            console.error(error);
        }
    }
};

async function bal(one, two) {
    try {
        let avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        avone.circle();
        let avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        avtwo.circle();
        let pth = "abcd.png";
        let img = await jimp.read("Z");

        await img.writeAsync(pth);
        return pth;
    } catch (error) {
        console.error("Error processing images:", error);
        throw error;
    }
}