module.exports.config = {
  name: "animefy",
  version: "1.0.",
  hasPermssion: 0,
  credits: "Clark",
  description: "Animefy your photo",
  commandCategory: "generate",
  usePrefix: false,
  usages: "[reply image]",
  cooldowns: 2,
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require('axios');
  const fs = require('fs-extra');
  let pathie = __dirname + `/cache/animefy.jpg`;
  const { threadID, messageID } = event;
  
  var james = event.messageReply.attachments[0].url || args.join(" ");
  
 try {
    const lim = await axios.get(`https://animeify.shinoyama.repl.co/convert-to-anime?imageUrl=${encodeURIComponent(james)}`);
     const image = lim.data.urls[1];
     
     const img = (await axios.get(`https://www.drawever.com${image}`, { responseType: "arraybuffer"})).data;
     
     fs.writeFileSync(pathie, Buffer.from(img, 'utf-8'));
     
     api.sendMessage({
       body: "✅ | 𝗁𝖾𝗋𝖾'𝗌 𝗒𝗈𝗎𝗋 𝖺𝗇𝗂𝗆𝖾𝖿𝗂𝖾𝖽 𝗂𝗆𝖺𝗀𝖾",
       attachment: fs.createReadStream(pathie)
     }, threadID, () => fs.unlinkSync(pathie), messageID);
     
     
       
  } catch (e) {
  api.sendMessage(`❎ | 𝖲𝗈𝗋𝗋𝗒, 𝖺𝗇 𝖾𝗋𝗋𝗈𝗋 𝗁𝖺𝗌 𝗈𝖼𝖼𝗎𝗋𝗋𝖾𝖽:\n\n${e}`, threadID, messageID);
  };
  
};