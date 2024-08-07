const { getStreamFromURL } = global.utils;
const axios = require("axios");

const API = 'https://anime-api.shahadat2006hh.workers.dev';
const URL_SHORTENER_API = 'https://url69.onrender.com';
const API_KEY = 'rehat-gay';

module.exports = {
  config: {
    name: "anime",
    aliases: ["anime"],
    version: "1.0",
    author: "shahadat20066",
    countDown: 5,
    role: 0,
    shortDescription: "Get anime data",
    longDescription: "Search and get anime info",
    category: "anime",
    guide: {
      en: "{pn} popular\n{pn} search <name>\n\nExample:\n{pn} popular\n{pn} search Naruto"
    }
  },

  onStart: async function ({ message, args, event }) {
    if (args.length === 0) {
      return message.reply(`⚠ | Please enter a command!`);
    }

    const command = args[0];
    const query = args.slice(1).join(" ");
    
    try {
      if (command.toLowerCase() === 'popular') {
        const res = await axios.get(`${API}/gogoPopular/1`);
        const animeList = res.data.results.slice(0, 6);

        if (animeList.length === 0) {
          return message.reply(`🥺 Not Found`);
        }

        let replyText = "===「 Popular Anime 」===\n\n";
        for (let i = 0; i < animeList.length; i++) {
          const anime = animeList[i];
          replyText += `${i + 1}. 🔰 Title: ${anime.title}\n    🗓️ Release: ${anime.releaseDate}\n\n`;
        }

        const form = {
          body: replyText,
          attachment: await Promise.all(animeList.map(anime => getStreamFromURL(anime.image)))
        };

        message.reply(form, async (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: 'searchResults',
              data: animeList
            });
          }
        });

      } else if (command.toLowerCase() === 'search') {
        if (!query) {
          return message.reply(`⚠ | Please enter anime name to search!`);
        }

        const res = await axios.get(`${API}/search/${query}`);
        const animeList = res.data.results.slice(0, 6);

        if (animeList.length === 0) {
          return message.reply(`🥺 Not Found`);
        }

        let replyText = `===「 Anime search result for: ${query} 」===\n\n`;
        for (let i = 0; i < animeList.length; i++) {
          const anime = animeList[i];
          replyText += `${i + 1}. 🔰 Title: ${anime.title}\n    🗓️ Release: ${anime.releaseDate}\n\n`;
        }

        const form = {
          body: replyText,
          attachment: await Promise.all(animeList.map(anime => getStreamFromURL(anime.img)))
        };

        message.reply(form, async (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: 'searchResults',
              data: animeList
            });
          }
        });

      } else {
        return message.reply(`⚠ | Invalid command!`);
      }

    } catch (e) {
      message.reply(`🥺 Not Found`);
      console.error(e.message);
    }
  },

  onReply: async function ({ message, event, Reply, args }) {
    const { author, type, data } = Reply;
    if (event.senderID !== author) return;

    const selectedIndex = parseInt(args[0], 10) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= data.length) {
      return message.reply(`⚠ | Invalid selection!`);
    }

    const selectedAnime = data[selectedIndex];

    try {
      if (type === 'searchResults') {
        const res = await axios.get(`${API}/anime/${selectedAnime.id}`);
        const animeInfo = res.data.results;

        const form = {
          body: `===「 Anime Info 」===\n\nName: ${animeInfo.name}\nType: ${animeInfo.type}\nPlot summary: ${animeInfo.plot_summary}\nGenre: ${animeInfo.genre}\nRelease: ${animeInfo.released}\nStatus: ${animeInfo.status}\nOther name: ${animeInfo.other_name}`,
          attachment: await getStreamFromURL(animeInfo.image)
        };

        message.reply(form, async (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: 'animeInfo',
              data: animeInfo.episodes,
              infoImg: animeInfo.image
            });
          }
        });

      } else if (type === 'animeInfo') {
        const episodeNumber = selectedIndex + 1;
        const selectedEpisode = data[selectedIndex];
        const episodeId = selectedEpisode[1];

        const res = await axios.get(`${API}/download/${episodeId}`);
        const downloadLinks = res.data.results;

        let replyText = `Here is your episode ${episodeNumber} download link senpai\n`;
        const qualities = ['640x360', '854x480', '1280x720', '1920x1080'];

        for (const quality of qualities) {
          const url = downloadLinks[quality];
          const shortRes = await axios.get(`${URL_SHORTENER_API}/?url=${encodeURIComponent(url)}&apikey=${API_KEY}`);
          replyText += `${quality}: ${shortRes.data.shortUrl}\n\n`;
        }

        message.reply(replyText, async (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: 'downloadLinks',
              data: downloadLinks
            });
          }
        });
      }
    } catch (e) {
      message.reply(`🥺 An error occurred`);
      console.error(e.message);
    }
  }
};

async function search(query) {
  const url = `${API}/search/${query}`;
  const response = await axios.get(url);
  return response.data;
};

async function getInfo(id) {
  const url = `${API}/anime/${id}`;
  const response = await axios.get(url);
  return response.data;
};

async function watch(id) {
  const url = `${API}/episode/${id}`;
  const response = await axios.get(url);
  return response.data;
}

async function download(id) {
  const url = `${API}/download/${id}`;
  const response = await axios.get(url);
  return response.data;
}
