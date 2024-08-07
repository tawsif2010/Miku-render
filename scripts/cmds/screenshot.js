const axios = require('axios');

module.exports = {
  config: {
    name: 'screenshot',
    aliases: ["ss"],
    version: '1.0',
    author: 'UPoL',
    description: 'Takes a screenshot of a given URL',
    category: 'Utility'
  },
  onStart: async function ({ event, api, args }) {
    const url = args.join(' ');
    if (!url) {
      return api.sendMessage('Please provide a URL to take a screenshot of.', event.threadID);
    }

    const apiUrl = `https://global-sprak.onrender.com/api/screenshot?url=${encodeURIComponent(url)}`;

    try {
      const response = await axios.get(apiUrl, { responseType: 'stream' });
      const imageStream = response.data;

      api.sendMessage({
        body: '✅ Here is your screenshot:',
        attachment: imageStream
      }, event.threadID);
    } catch (error) {
      api.sendMessage(`Error taking screenshot: ${error.message}`, event.threadID);
    }
  }
};