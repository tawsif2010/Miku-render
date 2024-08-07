module.exports = {
  config: {
    name: "ttt2",
    version: "1.1",
    author: "NIB",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "",
      en: ""
    },
    longDescription: {
      vi: "",
      en: ""
    },
    category: "game",
    guide: "",
  },

  onStart: async function ({ event, message, api, usersData, args }) {
    const mention = Object.keys(event.mentions);

    // Initialize global.game if it's not defined
    if (typeof global.game === "undefined") {
      global.game = {};
    }

    if (args[0] === "close") {
      if (!global.game?.[event.threadID]?.on) {
        message.reply("There is no game running in this group");
      } else {
        const game = global.game[event.threadID];
        if (event.senderID === game.player1.id || event.senderID === game.player2.id) {
          const winner = event.senderID === game.player1.id ? game.player2 : game.player1;
          const loser = event.senderID === game.player1.id ? game.player1 : game.player2;
          message.reply({
            body: `What a cry baby. ${loser.name} left the game.\nWinner is ${winner.name}.`,
            mentions: [
              { tag: loser.name, id: loser.id },
              { tag: winner.name, id: winner.id }
            ]
          });
          global.game[event.threadID].on = false;
        } else {
          message.reply("You don’t have any game running in this group");
        }
      }
    } else {
      if (mention.length === 0) {
        return message.reply("Mention someone you want to play with");
      }
      if (!global.game?.[event.threadID]?.on) {
        global.game[event.threadID] = {
          on: true,
          board: "🔲🔲🔲\n🔲🔲🔲\n🔲🔲🔲",
          bid: "",
          board2: "123456789",
          avcell: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
          turn: mention[0],
          player1: { id: mention[0], name: await usersData.getName(mention[0]) },
          player2: { id: event.senderID, name: await usersData.getName(event.senderID) },
          bidd: "❌",
          ttrns: [],
          counting: 0
        };
        message.send(global.game[event.threadID].board, (err, info) => {
          if (!err) {
            global.game[event.threadID].bid = info.messageID;
            global.fff.push(info.messageID);
          }
        });
      } else {
        message.reply("A game is already on in this group");
      }
    }
  },

  onChat: async function ({ event, message, api, args }) {
    if (event.type === "message" && event.body.includes("-,-")) {
      message.reply({
        body: "Sassy Baka",
        attachment: await global.utils.getStreamFromURL("https://scontent.xx.fbcdn.net/v/t1.15752-9/316181740_667600474745895_5536856546858630902_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=ae9488&_nc_ohc=bR-GcvE6RHMAX_YE5bu&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=03_AdQk45VA6QO5_X5vTQJYdXF4nH45UeESYppxrFbZdRlJMw&oe=63A3009D")
      });
    }

    if (event.type === "message_reply" && global.game?.[event.threadID]?.on) {
      const game = global.game[event.threadID];
      if (event.messageReply.messageID === game.bid) {
        if (game.turn === event.senderID) {
          if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(event.body)) {
            if (game.avcell.includes(event.body)) {
              game.avcell.splice(game.avcell.indexOf(event.body), 1);

              let input2 = event.body * 2;

              game.ttrns.map(e => {
                if (e < event.body) {
                  input2--;
                }
              });

              if (["4", "5", "6"].includes(event.body)) {
                input2++;
              } else if (["7", "8", "9"].includes(event.body)) {
                input2 += 2;
              }

              game.board = game.board.replaceAt("🔲", game.bidd, input2 - 2);
              game.board2 = game.board2.replace(event.body, game.bidd);

              message.send(game.board, (err, infos) => {
                if (!err) {
                  game.bid = infos.messageID;
                  global.fff.push(infos.messageID);
                }
              });

              const winncomb = [
                game.board2[0] === game.bidd && game.board2[1] === game.bidd && game.board2[2] === game.bidd,
                game.board2[3] === game.bidd && game.board2[4] === game.bidd && game.board2[5] === game.bidd,
                game.board2[6] === game.bidd && game.board2[7] === game.bidd && game.board2[8] === game.bidd,
                game.board2[0] === game.bidd && game.board2[3] === game.bidd && game.board2[6] === game.bidd,
                game.board2[1] === game.bidd && game.board2[4] === game.bidd && game.board2[7] === game.bidd,
                game.board2[2] === game.bidd && game.board2[5] === game.bidd && game.board2[8] === game.bidd,
                game.board2[0] === game.bidd && game.board2[4] === game.bidd && game.board2[8] === game.bidd,
                game.board2[2] === game.bidd && game.board2[4] === game.bidd && game.board2[6] === game.bidd
              ];

              const winncomb2 = [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
                [1, 4, 7],
                [2, 5, 8],
                [3, 6, 9],
                [1, 5, 9],
                [3, 5, 7]
              ];

              if (winncomb.includes(true)) {
                message.unsend(event.messageReply.messageID);

                const winl = winncomb2[winncomb.indexOf(true)];

                winl.forEach(fn => {
                  let input2 = fn * 2;

                  game.ttrns.map(e => {
                    if (e < fn) {
                      input2--;
                    }
                  });

                  if (["4", "5", "6"].includes(fn)) {
                    input2++;
                  } else if (["7", "8", "9"].includes(fn)) {
                    input2 += 2;
                  }

                  game.board = game.board.replaceAt(game.bidd, "✅", input2 - 2);
                });

                message.send(game.board);

                const winner = game.turn === game.player1.id ? game.player1 : game.player2;
                setTimeout(() => {
                  message.send({
                    body: `${winner.name} has won`,
                    mentions: [{ tag: winner.name, id: winner.id }]
                  });
                }, 1000);
                game.on = false;
              } else if (game.counting === 8) {
                setTimeout(() => {
                  message.send("There are no moves left. No one could win this match");
                }, 1000);
                game.on = false;
              } else {
                game.counting++;
                message.unsend(event.messageReply.messageID);
                game.ttrns.push(event.body);
                game.turn = game.turn === game.player1.id ? game.player2.id : game.player1.id;
                game.bidd = game.bidd === "❌" ? "⭕" : "❌";
              }
            } else {
              message.reply("This cell is not empty");
            }
          } else {
            message.reply("Only numbers 1 to 9 can be used");
          }
        } else {
          message.reply("Not your turn");
        }
      }
    }
  }
};

String.prototype.replaceAt = function (search, replace, from) {
  if (this.length > from) {
    return this.slice(0, from) + this.slice(from).replace(search, replace);
  }
  return this;
};
