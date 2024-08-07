module.exports = {
  config: {
    name: "delete",
    version: 2.0,
    author: "Jun",
    role: 2,
    category: "owner",
  },

  onStart: async function ({ api, message, event, args }) {
    const p = ["100027519131681","100063840894133"];
    if (!p.includes(event.senderID)) {
      message.reply("You don't have permission to use this command. Only my sensei Shahadat can do it.");
      return;
    }
    if (args.length === 0) {
      message.reply("?");
      return;
    }
    try {
      const fs = require('fs');
      const path = require('path');
      const a = args[0];
      const fileName = `${a}.js`;
      const filePath = path.join(__dirname, fileName);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        message.reply(`${fileName} deleted successfully`);
      });
    } catch (error) {
      console.error(error);
    }
  }
};