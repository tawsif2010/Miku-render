const fs = require('fs-extra');
const pathFile = __dirname + '/cache/txt/antiunsend.txt';

module.exports.config = {
  name: "antiunsend",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "N/A",
  description: "Enable or disable anti-unsend functionality",
  usePrefix: true,
  commandCategory: "Admin",
  usages: "on/off",
  cooldowns: 5,
};

module.exports.handleEvent = async ({ api, event }) => {
  if (!fs.existsSync(pathFile))
    fs.writeFileSync(pathFile, 'false');
    
  const isEnable = fs.readFileSync(pathFile, 'utf-8');
  
  if (isEnable === 'true' && event.type === 'unsend' && event.author === api.getCurrentUserID()) {
    const { threadID, messageID } = event;
    const messageData = await api.getMessageInfo(messageID, threadID);
    console.log('Unsent message:', messageData);
    // Perform necessary actions, such as logging or re-sending the message
  }
};

module.exports.run = async ({ api, event, args }) => {
  try {
    if (args[0] === 'on') {
      fs.writeFileSync(pathFile, 'true');
      api.sendMessage('Anti-unsend has been enabled!', event.threadID, event.messageID);
    } else if (args[0] === 'off') {
      fs.writeFileSync(pathFile, 'false');
      api.sendMessage('Anti-unsend has been disabled!', event.threadID, event.messageID);
    } else {
      api.sendMessage('Incorrect syntax', event.threadID, event.messageID);
    }
  } catch (e) {
    console.log(e);
  }
};
