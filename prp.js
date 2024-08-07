const fs = require('fs');

module.exports = {
  config: {
    name: 'prp',
    category: 'fun',
    role: 0,
    guide: {
      en: '{pn} <@tag>'
    },
    author: 'UPoL🐔',
    longDescription: 'Propose a user with mention'
  },
  onStart: async function ({ message, event, args, usersData }) {

    const { threadID, senderID, messageID } = event;

    const user = event.senderID;
    const userName = await usersData.getName(user);

    const mention = Object.keys(event.mentions)[0];
    const mentionedUserName = await usersData.getName(mention);

    if (!mention) {
      return message.reply('Please tag a user to propose.');
    } 

    await message.reply('Giving the proposal to a user, Please wait....');
    
    const proposalMessage = `Hey ${mentionedUserName} 😺, ${userName} wants to propose you. Do you accept? 🥳`;
    const proposalOptions = ({
      body: proposalMessage,
      attachment: fs.createReadStream('proposal2.mp4')
    });
    return message.reply(proposalOptions);
  }
};