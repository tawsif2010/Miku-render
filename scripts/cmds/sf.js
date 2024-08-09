const fs = require('fs');
module.exports = {
  config: {
    name: "sf",
    version: "1.0",
    author: "MD Tawsif",
    countDown: 5,
    role: 0,
    shortDescription: "no prefix",
    longDescription: "no prefix",
    category: "no prefix",
  },
  onStart: async function(){},
  onChat: async function({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "omg") {
      return message.reply({
        body: "😎😎😎",
        attachment: fs.createReadStream("Messenger_creation_344946322020045.mp4"),
      });
    }
  }
};
