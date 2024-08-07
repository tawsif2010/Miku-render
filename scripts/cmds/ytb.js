const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const { getStreamFromURL, downloadFile, formatNumber } = global.utils;

async function getStreamAndSize(url, path = "") {
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
    headers: { 'Range': 'bytes=0-' }
  });

  if (path) response.data.path = path;
  const totalLength = response.headers["content-length"];
  return { stream: response.data, size: totalLength };
}

module.exports = {
  config: {
    name: "ytb",
    version: "1.16",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    description: {
      vi: "Tải video, audio hoặc xem thông tin video trên YouTube",
      en: "Download video, audio or view video information on YouTube"
    },
    category: "media",
    guide: {
      vi: "   {pn} [video|-v] [<tên video>|<link video>]: dùng để tải video từ youtube."
        + "\n   {pn} [audio|-a] [<tên video>|<link video>]: dùng để tải audio từ youtube"
        + "\n   {pn} [info|-i] [<tên video>|<link video>]: dùng để xem thông tin video từ youtube"
        + "\n   Ví dụ:"
        + "\n    {pn} -v Fallen Kingdom"
        + "\n    {pn} -a Fallen Kingdom"
        + "\n    {pn} -i Fallen Kingdom",
      en: "   {pn} [video|-v] [<video name>|<video link>]: use to download video from youtube."
        + "\n   {pn} [audio|-a] [<video name>|<video link>]: use to download audio from youtube"
        + "\n   {pn} [info|-i] [<video name>|<video link>]: use to view video information from youtube"
        + "\n   Example:"
        + "\n    {pn} -v Fallen Kingdom"
        + "\n    {pn} -a Fallen Kingdom"
        + "\n    {pn} -i Fallen Kingdom"
    }
  },

  langs: {
    vi: {
      error: "❌ Đã xảy ra lỗi: %1",
      noResult: "⭕ Không có kết quả tìm kiếm nào phù hợp với từ khóa %1",
      choose: "%1Reply tin nhắn với số để chọn hoặc nội dung bất kì để gỡ",
      video: "video",
      audio: "âm thanh",
      downloading: "⬇️ Đang tải xuống %1 \"%2\"",
      downloading2: "⬇️ Đang tải xuống %1 \"%2\"\n🔃 Tốc độ: %3MB/s\n⏸️ Đã tải: %4/%5MB (%6%)\n⏳ Ước tính thời gian còn lại: %7 giây",
      noVideo: "⭕ Rất tiếc, không tìm thấy video nào có dung lượng nhỏ hơn 83MB",
      noAudio: "⭕ Rất tiếc, không tìm thấy audio nào có dung lượng nhỏ hơn 26MB",
      info: "💠 Tiêu đề: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Thời gian video: %4\n👀 Lượt xem: %5\n👍 Lượt thích: %6\n🆙 Ngày tải lên: %7\n🔠 ID: %8\n🔗 Link: %9",
      listChapter: "\n📖 Danh sách phân đoạn: %1\n"
    },
    en: {
      error: "❌ An error occurred: %1",
      noResult: "⭕ No search results match the keyword %1",
      choose: "%1Reply to the message with a number to choose or any content to cancel",
      video: "video",
      audio: "audio",
      downloading: "⬇️ Downloading %1 \"%2\"",
      downloading2: "⬇️ Downloading %1 \"%2\"\n🔃 Speed: %3MB/s\n⏸️ Downloaded: %4/%5MB (%6%)\n⏳ Estimated time remaining: %7 seconds",
      noVideo: "⭕ Sorry, no video was found with a size less than 83MB",
      noAudio: "⭕ Sorry, no audio was found with a size less than 26MB",
      info: "💠 Title: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Video duration: %4\n👀 View count: %5\n👍 Like count: %6\n🆙 Upload date: %7\n🔠 ID: %8\n🔗 Link: %9",
      listChapter: "\n📖 List chapter: %1\n"
    }
  },

  onStart: async function ({ args, message, event, commandName, getLang }) {
    const type = getType(args[0]);
    if (!type) return message.SyntaxError();

    const urlYtb = isYouTubeUrl(args[1]);
    if (urlYtb) {
      const infoVideo = await getVideoInfo(args[1]);
      handle({ type, infoVideo, message, downloadFile, getLang });
      return;
    }

    const keyWord = sanitizeKeyWord(args.slice(1).join(" "));
    const maxResults = 6;

    try {
      const result = (await search(keyWord)).slice(0, maxResults);
      if (result.length === 0) return message.reply(getLang("noResult", keyWord));
      
      const msg = formatSearchResults(result);
      const thumbnails = result.map(info => getStreamFromURL(info.thumbnail));

      message.reply({
        body: getLang("choose", msg),
        attachment: await Promise.all(thumbnails)
      }, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          arrayID: result.map(info => info.id),
          result,
          type
        });
      });
    } catch (err) {
      return message.reply(getLang("error", err.message));
    }
  },

  onReply: async ({ event, api, Reply, message, getLang }) => {
    const { result, type } = Reply;
    const choice = parseInt(event.body, 10);

    if (!isNaN(choice) && choice <= 6 && choice > 0) {
      const infoChoice = result[choice - 1];
      const infoVideo = await getVideoInfo(infoChoice.id);
      api.unsendMessage(Reply.messageID);
      await handle({ type, infoVideo, message, getLang });
    } else {
      api.unsendMessage(Reply.messageID);
    }
  }
};

function getType(arg) {
  switch (arg) {
    case "-v":
    case "video": return "video";
    case "-a":
    case "-s":
    case "audio":
    case "sing": return "audio";
    case "-i":
    case "info": return "info";
    default: return null;
  }
}

function isYouTubeUrl(url) {
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  return checkurl.test(url);
}

function sanitizeKeyWord(keyWord) {
  return keyWord.includes("?feature=share") ? keyWord.replace("?feature=share", "") : keyWord;
}

function formatSearchResults(results) {
  return results.map((info, index) => `${index + 1}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`).join('');
}

async function handle({ type, infoVideo, message, getLang }) {
  const { title, videoId } = infoVideo;

  if (type === "video") {
    await handleVideoDownload({ infoVideo, message, getLang });
  } else if (type === "audio") {
    await handleAudioDownload({ infoVideo, message, getLang });
  } else if (type === "info") {
    await handleVideoInfo({ infoVideo, message, getLang });
  }
}

async function handleVideoDownload({ infoVideo, message, getLang }) {
  const MAX_SIZE = 83 * 1024 * 1024; // 83MB
  const { title, videoId } = infoVideo;
  const msgSend = message.reply(getLang("downloading", getLang("video"), title));
  const { formats } = await ytdl.getInfo(videoId);
  const getFormat = formats
    .filter(f => f.hasVideo && f.hasAudio && f.quality == 'tiny' && f.audioBitrate == 128)
    .sort((a, b) => b.contentLength - a.contentLength)
    .find(f => f.contentLength < MAX_SIZE);

  if (!getFormat) return message.reply(getLang("noVideo"));

  try {
    await downloadAndSendFile({ message, msgSend, getFormat, title, getLang, type: "video" });
  } catch (err) {
    message.reply(getLang("error", err.message));
  }
}

async function handleAudioDownload({ infoVideo, message, getLang }) {
  const MAX_SIZE = 26 * 1024 * 1024; // 26MB
  const { title, videoId } = infoVideo;
  const msgSend = message.reply(getLang("downloading", getLang("audio"), title));
  const { formats } = await ytdl.getInfo(videoId);
  const getFormat = formats
    .filter(f => f.hasAudio && !f.hasVideo && f.audioBitrate == 128)
    .sort((a, b) => b.contentLength - a.contentLength)
    .find(f => f.contentLength < MAX_SIZE);

  if (!getFormat) return message.reply(getLang("noAudio"));

  try {
    await downloadAndSendFile({ message, msgSend, getFormat, title, getLang, type: "audio" });
  } catch (err) {
    message.reply(getLang("error", err.message));
  }
}

async function handleVideoInfo({ infoVideo, message, getLang }) {
  const {
    title, channel, lengthSeconds, viewCount, publishDate, videoId, url, chapters
  } = infoVideo;
  const { subscriberCount, name } = channel;

  const msg = getLang("info", title, name, formatNumber(subscriberCount), 
    formatDuration(lengthSeconds), formatNumber(viewCount), formatNumber(infoVideo.likes), 
    publishDate, videoId, url);

  if (chapters.length > 0) {
    const chapterList = chapters.map(({ title, start_time }) => 
      `\n- ${title} (${formatDuration(start_time)})`).join('');
    message.reply(msg + getLang("listChapter", chapterList));
  } else {
    message.reply(msg);
  }
}

async function downloadAndSendFile({ message, msgSend, getFormat, title, getLang, type }) {
  const ext = type === "video" ? "mp4" : "mp3";
  const path = `${__dirname}/tmp/${title}.${ext}`;

  const { stream, size } = await getStreamAndSize(getFormat.url, path);

  const writer = fs.createWriteStream(path);
  stream.pipe(writer);

  let downloadedSize = 0;
  let speed = 0;
  const startTime = Date.now();

  stream.on('data', chunk => {
    downloadedSize += chunk.length;
    speed = downloadedSize / (1024 * 1024) / ((Date.now() - startTime) / 1000);
    message.unsend((await msgSend).messageID);
    msgSend = message.reply(getLang("downloading2", getLang(type), title, 
      speed.toFixed(1), (downloadedSize / (1024 * 1024)).toFixed(1), 
      (size / (1024 * 1024)).toFixed(1), ((downloadedSize / size) * 100).toFixed(1), 
      Math.ceil(size / (1024 * speed))));
  });

  writer.on('finish', async () => {
    message.unsend((await msgSend).messageID);
    message.reply({ body: title, attachment: fs.createReadStream(path) });
    await fs.unlinkSync(path);
  });
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds].map(unit => String(unit).padStart(2, '0')).join(':');
}