const fs = require('fs');
module.exports = {
  config: {
    name: "proposal3",
    version: "1.0",
    author: "UPoL@DUcK",
    role: 0,
    shortDescription: "get the audio with no-prefix",
    category: "no prefix",
  },
  onStart: async function(){},
  onChat: async function({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "cmd_name") {
      return message.reply({
        body: " ${name} to ${nsme} ",
        attachment: fs.createReadStream("proposal2.mp4"),
      });
    }
  }
};