const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: "artvideo",
    aliases: ["artv","avid","av"],
    version: "1.0.0",
    author: "Fahim the Noob",
    role: 0,
    shortDescription: {
      en: "Send an art video"
    },
    longDescription: {
      en: "Fetches an art video from the provided API, downloads it, and sends it to the chat"
    },
    category: "video",
    guide: {
      en: "Type 'artvideo' or 'avid' to get an art video."
    }
  },
  onStart: async function ({ api, message, event }) {
    try {
      const response = await axios.get('https://artvideo.onrender.com/video/apikey=Khang');
      const videoUrl = response.data.url;
      message.reaction("🕑", event.messageID); 
      const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
      const videoStream = fs.createWriteStream('video.mp4');
      videoResponse.data.pipe(videoStream);
      
      await new Promise((resolve, reject) => {
        videoStream.on('finish', resolve);
        videoStream.on('error', reject);
      });
      
      await api.sendMessage({
        body: 'Here is your art video:',
        attachment: fs.createReadStream('video.mp4')
      }, event.threadID, event.messageID);
      
      fs.unlinkSync('video.mp4');
      await message.reaction("✅", event.messageID);
      
    } catch (error) {
      console.error(error);
      await api.sendMessage(`Sorry, there was an error fetching the video.`, event.threadID, event.messageID);
      await message.reaction("♈", event.messageID);
    }
  },
  onReply: async function ({ api, message, event, reply }) {
    // যদি আপনি কোনো বিশেষ ধরনের রিপ্লাই প্রয়োজন করেন, তাহলে এখানে লিখুন
    try {
      const response = await axios.get('https://artvideo.onrender.com/video/apikey=Khang');
      const videoUrl = response.data.url;
      const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
      const videoStream = fs.createWriteStream('video.mp4');
      videoResponse.data.pipe(videoStream);

      await new Promise((resolve, reject) => {
        videoStream.on('finish', resolve);
        videoStream.on('error', reject);
      });

      await api.sendMessage({
        body: 'Here is your art video:',
        attachment: fs.createReadStream('video.mp4')
      }, reply.threadID, reply.messageID);

      fs.unlinkSync('video.mp4');
      
    } catch (error) {
      console.error(error);
      await api.sendMessage(`Sorry, there was an error fetching the video.`, reply.threadID, reply.messageID);
    }
  }
};