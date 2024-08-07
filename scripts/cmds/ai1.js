const axios = require('axios');

const BASE_URL = 'https://dev-the-dark-lord.pantheonsite.io/wp-admin/js/Apis/Gemini.php';

module.exports = {
  config: {
    name: "ai1",
    aliases: ["ai1"],
    version: "1.0",
    author: "Hridoy",
    countDown: 5,
    role: 0,
    shortDescription: "get AI response",
    longDescription: "send user input to AI API and get response",
    category: "fun",
    guide: "{pn} <user text>"
  },

  onStart: async function ({ message, args }) {
    const userText = args.join(" ");
    if (!userText) {
      return message.reply(`⚠️ | Please enter text for AI!`);
    } else {
      const url = `${BASE_URL}?message=${encodeURIComponent(userText)}`;
      try {
        const res = await axios.get(url);
        const aiResponse = res.data;

        if (!aiResponse) {
          return message.reply(`🥺 No response found from AI.`);
        }

        message.reply(aiResponse);
      } catch (e) {
        console.error(`Error fetching AI response: ${e.message}`);
        message.reply(`🥺 Error fetching AI response. Please try again later.`);
      }
    }
  }
};
