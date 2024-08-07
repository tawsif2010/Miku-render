const axios = require('axios');

const Rômeo = [
  'ask',
   'gpt',
  'ai',
];

module.exports = {
  config: {
    name: 'ask',
    version: '1.0.1',
    author: 'Tawsif',
    role: 0,
    category: 'ai',
    longDescription: {
      en: 'This is a large Ai language model trained by MD Tawsif',
    },
    guide: {
      en: 'Simply use Ai and ask your question',
    },
  },

  langs: {
    en: {
      final: "",
      loading: '✅ | please wait...'
    }
  },

  onStart: async function () {},
  onChat: async function ({ api, event, args, getLang, message }) {
    try {
      const prefix = Rômeo.find((p) => event.body && event.body.toLowerCase().startsWith(p));

      if (!prefix) {
        return;
      }

      const prompt = event.body.substring(prefix.length).trim();

      const loadingMessage = getLang("loading");
      const loadingReply = await message.reply(loadingMessage);
      
      const response = await axios.get(`https://author-check.vercel.app/name?prompt=${encodeURIComponent(prompt)}`);

      if (response.status !== 200 || !response.data || !response.data.answer) {
        throw new Error('Invalid or missing response from API');
      }

      const messageText = response.data.answer; 

      const finalMsg = `${messageText}`;
      api.editMessage(finalMsg, loadingReply.messageID);

      console.log('Sent answer as a reply to user');
    } catch (error) {
      console.error(`Failed to get answer: ${error.message}`);
      api.sendMessage(
        `${error.message}.`,
        event.threadID
      );
    }
  }
};