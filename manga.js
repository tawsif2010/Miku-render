const axios = require('axios');

module.exports = {
  config: {
    name: "manga",
    aliases: ["manga"],
    version: "1.4",
    author: "shahadat20066",
    countDown: 5,
    role: 0,
    shortDescription: "Get manga data",
    longDescription: "Search and get manga infos",
    category: "anime",
    guide: {
      en: "{pn} search <name>\n{pn} <manga id> \n{pn} <manga id> <chapter id>\n\nExample:\n{pn} search Naruto\n{pn} manga-ng952689\n{pn} manga-ng952689 chapter-1"
    }
  },

  onStart: async function ({ message, args }) {
    if (args.length === 0) {
      return message.reply(`⚠ | Please enter a command!`);
    }

    const command = args[0];
    const query = args.slice(1).join(" ");
    const BASE_URL = `https://shahadats-manga-api.onrender.com/api`;

    try {
      if (command.toLowerCase() === 'search') {
        if (!query) {
          return message.reply(`⚠ | Please enter manga name to search!`);
        }

        // Search manga by name
        const res = await axios.get(`${BASE_URL}/search/${query}`);
        let mangaList = res.data.mangaList;

        if (mangaList.length === 0) {
          return message.reply(`🥺 Not Found`);
        }

        let manga = mangaList[0];
        let title = manga.title;
        let img = manga.image;
        let id = manga.id;

        const form = {
          body: `===「 Manga search result for:${query} 」===`
            + `\n\n🔰 Name: ${title}`
            + `\n🆔 ID: ${id}`
        };

        if (img) {
          form.attachment = await global.utils.getStreamFromURL(img);
        }

        message.reply(form);
      } else {
        const mangaId = command;
        const chapterId = args[1];

        if (!chapterId) {
          // Fetch general manga information
          const res = await axios.get(`${BASE_URL}/manga/${mangaId}`);
          const manga = res.data;

          const chapterIds = manga.chapterList.map(chapter => chapter.id.replace('chapter-', '')).join(', ');
          const topChapterId = manga.chapterList[0].id;

          const form = {
            body: `===「 Manga Info 」===`
              + `\n\n🔰 Name: ${manga.name}`
              + `\n🆔 ID: ${mangaId}`
              + `\n🖋 Author: ${manga.author}`
              + `\n📈 Status: ${manga.status}`
              + `\n📅 Updated: ${manga.updated}`
              + `\n👀 Views: ${manga.view}`
              + `\n📚 Genres: ${manga.genres.join(', ')}`
              + `\n📖 Total Chapters: ${topChapterId}`
              + `\n📃 Chapter IDs: chapter-${chapterIds}`
          };

          if (manga.imageUrl) {
            form.attachment = await global.utils.getStreamFromURL(manga.imageUrl);
          }

          message.reply(form);
        } else {
          // Fetch specific chapter information
          const res = await axios.get(`${BASE_URL}/manga/${mangaId}/${chapterId}`);
          const chapter = res.data;

          const form = {
            body: `===「 Manga Chapter」===`
              + `\n\n🔰 Title: ${chapter.title}`
              + `\n🆔 Manga ID: ${mangaId}`
              + `\n📖 Current Chapter: ${chapter.currentChapter}`
          };

          const images = chapter.images.map(img => img.image);
          const imageChunks = chunkArray(images, 39);

          for (let i = 0; i < imageChunks.length; i++) {
            await message.reply({
              body: i === 0 ? form.body : 'Next pages',
              attachment: await Promise.all(imageChunks[i].map(url => global.utils.getStreamFromURL(url)))
            });
          }
        }
      }
    } catch (e) {
      message.reply(`🥺 Not Found`);
    }
  }
};

function chunkArray(array, chunk_size) {
  const results = [];
  for (let i = 0; i < array.length; i += chunk_size) {
    results.push(array.slice(i, i + chunk_size));
  }
  return results;
}