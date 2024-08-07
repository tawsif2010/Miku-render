
const fs = require('fs');

module.exports = {
  config: {
    name: "proposal2",
    version: "1.0",
    author: "MD Tawsif",
    countDown: 5,
    role: 0,
    shortDescription: "propose someone",
    longDescription: "",
    category: "love",
  },
  onStart: async function ({ message, event, args }) {
    const mention = Object.keys(event.mentions);

    if (mention.length === 0) {
      return message.reply("Please mention someone");
    } else if (mention.length === 1) {
      return message.reply({
        body: ` ${mention[0]} to ${mention[1]} `,
        attachment: fs.createReadStream('proposal2.mp4'),
      });
    }
  },
};