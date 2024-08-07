module.exports = {
  config: {
    name: "offbot",
    version: "1.0",
    author: "Samir",
    countDown: 5,
    role: 0,
    shortDescription: "Turn off bot",
    longDescription: "Turn off bot",
    category: "owner",
    guide: "{pn}"
  },
  onStart: async function ({ event, api, thteadID, userID }) {
 
  const { threadID, senderID, messageID } = event;
const p = ["100063840894133"];
if (!p.includes(event.senderID)) {
return api.sendMessage('you don’t have permission to use this cmd. Only my owner MD Tawsif can do it')
};
    api.sendMessage("Miku turned off successfully✅",event.threadID, () =>process.exit(0))}
};