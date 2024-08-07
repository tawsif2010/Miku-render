const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "q",
    aliases: ["fakechat"],
    author: "Samir Œ /Pikachu Œ",
    
    countDown: 5,
    role: 0,
    category: "write",
    shortDescription: {
      en: "mentioned your friend and write something to get out put✍️",
    },
  },
  wrapText: async function (ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    for (const word of words) {
      const currentLine = `${line}${word} `;
      const currentLineWidth = ctx.measureText(currentLine).width;
      if (currentLineWidth <= maxWidth) {
        line = currentLine;
      } else {
        lines.push(line.trim());
        line = `${word} `;
      }
    }

    lines.push(line.trim());
    return lines;
  },

  drawBubbleLayer: function (ctx, x, y, width, height, radius, color) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  },

  onStart: async function ({ args, usersData, threadsData, api, event }) {
    let pathImg = __dirname + "/cache/background.png";
    let pathAvt1 = __dirname + "/cache/Avtmot.png";
    var id = Object.keys(event.mentions)[0] || event.senderID;
    var name = await api.getUserInfo(id);
    name = name[id].name;
    var ThreadInfo = await api.getThreadInfo(event.threadID);
    var background = ["https://i.postimg.cc/6pyLxmTV/IMG-20230630-235606.jpg"];
    var rd = background[Math.floor(Math.random() * background.length)];
    let getAvtmot = (
      await axios.get(
        `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));
    let getbackground = (
      await axios.get(`${rd}`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));
    let baseImage = await loadImage(pathImg);
    let baseAvt1 = await loadImage(pathAvt1);
    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // Adjust the dimensions and position of the text
    const commentMaxWidth = canvas.width - 200; // Maximum width for  text
    const commentX = 145; // X coordinate of the  text
    const commentY = 100; // Y coordinate of the  text

    const nameMaxWidth = canvas.width - 40; // Maximum width for name text
    const nameX = 35; // X coordinate of the name text
    const nameY = 50; // Y coordinate of the name text

    // Set the font and color for the text
    ctx.font = "600 23px Arial";
    ctx.fillStyle = "#B2BEB5"; // Black color for the text

    const mentionUser = args[0];
    const commentText = args.slice(args.indexOf("|") + 1).join(" ");

    const commentLines = await this.wrapText(ctx, commentText, commentMaxWidth);
    const nameLines = await this.wrapText(ctx, name, nameMaxWidth);

    // Draw the bubble layer for the comment text
    const bubbleX = commentX - 10;
    const bubbleY = commentY - 10;
    const bubbleWidth = commentMaxWidth + 20;
    const bubbleHeight = commentLines.length * 28 + 20;
    const bubbleRadius = 10;
    const bubbleColor = "#6f6f70"; // Light gray color for the bubble layer
    this.drawBubbleLayer(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, bubbleRadius, bubbleColor);

    // Draw the  text with yellow glow effect
    ctx.shadowColor = "#FFFF00"; // Yellow color for the glow effect
    ctx.shadowBlur = 10; // Adjust the blur radius for the glow effect
    commentLines.forEach((line, index) => {
      ctx.fillText(line, commentX, commentY + index * 28);
    });

    // Draw the name text with blue glow effect
    ctx.font = "300 16px Arial";
    ctx.shadowColor = "#00BFFF"; // Blue color for the glow effect
    ctx.shadowBlur = 10; // Adjust the blur radius for the glow effect
    nameLines.forEach((line, index) => {
      ctx.fillText(line, nameX, nameY + index * 28);
    });

    // Draw the avatar image
    const avatarX = 30; // X coordinate of the avatar
    const avatarY = 60; // Y coordinate of the avatar
    const avatarWidth = 60; // Width of the avatar
    const avatarHeight = 60; // Height of the avatar

    ctx.beginPath();
    ctx.arc(
      avatarX + avatarWidth / 2,
      avatarY + avatarHeight / 2,
      avatarWidth / 2,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(baseAvt1, avatarX, avatarY, avatarWidth, avatarHeight);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    fs.removeSync(pathAvt1);
    return api.sendMessage(
      {
        body: " ",
        attachment: fs.createReadStream(pathImg),
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  },
};
