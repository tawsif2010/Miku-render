const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "imagine",
    aliases: ["dall-e"],
    author: "Samir",
    version: "1.0",
    countDown: 10,
    role: 0,
    shortDescription: "Generates an image from a text description",
    longDescription: "Generates an image from a text description",
    category: "ai",
    guide: {
      en: "{pn} <text>"
    }
  },

  langs: {
    en: {
      loading: "Generating image, please wait...",
      error: "An error occurred, please try again later",
      approve_success: "The imagine command has been approved!",
    }
  },

    message.reply(getLang("loading"));
    const text = args.join(' ');

    try {
      const { data } = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'image-alpha-001',
          prompt: text,
          num_images: 1
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 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`
          }
        }
      );
      const imageURL = data.data[0].url;
      const image = await getStreamFromURL(imageURL);
      return message.reply({
        attachment: image
      });
    } catch (err) {
      return message.reply(getLang("error"));
    }
  }
};