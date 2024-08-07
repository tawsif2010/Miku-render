let axios = require('axios');

module.exports = {
  config: {
    name: "quiz2",
    version: "1.0",
    author: "Eijah Noah",
    countDown: 30,
    role: 0,
    category: "game"
  },

  onReply: async function ({ args, event, api, Reply, commandName, usersData }) {
    let { dataGame, answer, nameUser } = Reply;
    if (event.senderID !== Reply.author) return;

    switch (Reply.type) {
      case "reply": {
        let userReply = event.body.toLowerCase();

        if (userReply === answer.toLowerCase()) {
          api.unsendMessage(Reply.messageID).catch(console.error);
          let rewardCoins = 5000;
          let rewardExp = 20;
          let senderID = event.senderID;
          let userData = await usersData.get(senderID);
          await usersData.set(senderID, {
            money: userData.money + rewardCoins,
            exp: userData.exp + rewardExp,
            data: userData.data
          });
          let msg = {
            body: `✅ | ${nameUser}, Your answer is correct and ${rewardCoins}$ for you dear`
          };
          return api.sendMessage(msg, event.threadID, event.messageID);
        } else {
          api.unsendMessage(Reply.messageID);
          let msg = `sorry ${nameUser} , The answer is incorrect`;
          return api.sendMessage(msg, event.threadID);
        }
      }
    }
  },

  onStart: async function ({ api, event, usersData, commandName }) {
    let { threadID, messageID } = event;
    let timeout = 60;

    try {
      let response = await axios.get('https://api.vyturex.com/quiz');
      let quizData = response.data;
  let namePlayerReact = await usersData.getName(event.senderID);

      let msg = {
      body: `${quizData.question} \n\nA ) ${quizData.A} \nB ) ${quizData.B}\nC ) ${quizData.C}\nD ) ${quizData.D}\n\nReply with the answer`,
      };

      api.sendMessage(msg, threadID, async (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          type: "reply",
          commandName,
          author: event.senderID,
          messageID: info.messageID,
          dataGame: quizData,
          answer: quizData.answer,
          nameUser: namePlayerReact
        });

        setTimeout(function () {
          api.unsendMessage(info.messageID);
        }, timeout * 1000);
      });
    } catch (error) {
      console.error("Error Occurred:", error);
    }
  }
};