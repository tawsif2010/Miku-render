const axios = require('axios');

module.exports = {
  config: {
    name: "bing",
    version: "1.3",
    author: "ArYAN",
    shortDescription: { 
       en: 'Converts text to image' 
       },
    longDescription: { 
       en: "Generates images based on provided text using Bing API."
       },
    category: "media",
    countDown: 10,
    role: 0,
    guide: { en: '{p} bing your prompt' }
  },

  onStart: async function ({ api, event, args, message }) {
    const text = args.join(" ");
    if (!text) {
      return message.reply("👑| Please provide some prompts .");
    }

    message.reply(`⚙Creating your imagination, please wait...`, async (err, info) => {
      let ui = info.messageID;
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      try {
        const response = await axios.get(`https://personal-bing.onrender.com/api/bing?prompt=${encodeURIComponent(text)}`);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        const images = response.data.url;
        if (!images) {
          throw new Error("Images data is missing in the response");
        }
        message.unsend(ui);
        message.reply({
          body: `🖼 [𝗕𝗜𝗡𝗚] \n━━━━━━━━━━━━\n\nPlease reply with the image number (1, 2, 3, 4) to get the corresponding image in high resolution.`,
          attachment: await Promise.all(images.map(img => global.utils.getStreamFromURL(img)))
        }, async (err, info) => {
          if (err) return console.error(err);
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            imageUrls: images
          });
        });
      } catch (error) {
        console.error(error);
        api.sendMessage(`❌ Error with status code ${error.message} , contact to Aryan to slove this error!`, event.threadID);
      }
    });
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const { author, imageUrls } = Reply;
    if (event.senderID !== author) return;
    try {
      const reply = parseInt(args[0]);
      if (reply >= 1 && reply <= 4) {
        const img = imageUrls[reply - 1];
        message.reply({ attachment: await global.utils.getStreamFromURL(img) });
      } else {
        message.reply("❌ Invalid image number. Please reply with a number between 1 and 4.");
      }
    } catch (error) {
      console.error(error);
      api.sendMessage(`❌ Error with status code ${error.message} , contact to Aryan to slove this error!`, event.threadID);
    }
    message.unsend(Reply.messageID); 
  },
};