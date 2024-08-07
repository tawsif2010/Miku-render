const fetch = (...args) => import('node-fetch').then(({
    default: fetch
}) => fetch(...args));
const fs = require('fs');
const protectedIds = ["100038029237574", "", "", "", "", ""];
module.exports = {
    config: {
        name: "fakechat",
        aliases: ["q"],
        version: "1.0",
        author: "Samir œ",
        countDown: 10,
        role: 0,
        shortDescription: "Make Fake chat",
        longDescription: "Make Fake Chat",
        category: "𝗙𝗨𝗡",
        guide: {
            en: "{pn} message | uid or mention | fblink | me\nExample:\n⭔ {pn} text | me\n⭔ {pn} text | 12282928288\n⭔ {pn} text | @mention\n⭔ {pn} text | https://www.facebook.com/\n⭔ {pn} text (with reply)\n\n⭔ Note:\nyou can reply to any image to add that in the fakechat."
        }
    },
    onStart: async function({
        api,
        args,
        message,
        event
    }) {
        try {
            const {
                findUid,
                getPrefix
            } = global.utils;
            const p = getPrefix(event.threadID);
            let uid = null;
            let Message = null;
            let imageUrl = null;
            const input = args.join(' ');
            if (!input) {
                message.reply(`useless noob add something 😪🫵\n\nFollow :\n${p}Fakechat input | @tag or uid or fblink or me\n\ntype:\n${p}help FakeChat\nto see how to use this cmd 🗿`);
                return
            }
 
            let replySenderId = null;
            if (event.messageReply) {
                if (["photo", "sticker"].includes(event.messageReply.attachments[0]?.type)) {
                    imageUrl = event.messageReply.attachments[0].url
                }
 
                replySenderId = event.messageReply.senderID
            }
 
            if (input.includes('|')) {
                const inputPart = input.split('|');
                if (inputPart.length === 2) {
                    Message = inputPart[0].trim();
                    uid = inputPart[1].trim()
                } else {
                    message.reply(`Learn first how to use you idiot 🗿\n\nFollow :\n${p}Fakechat input | @tag or uid or fblink or me\ntype:\n${p}help Fakechat\nto see how to use this cmd🗿🐍`);
                    return
                }
 
                if (uid.toLowerCase() === "me") {
                    uid = event.senderID
                } else if (event.mentions && Object.keys(event.mentions).length > 0) {
                    uid = Object.keys(event.mentions)[0]
                } else if (/^\d+$/.test(uid)) {} else if (uid.includes('facebook.com')) {
                    let linkUid;
                    try {
                        linkUid = await findUid(uid)
                    } catch (error) {
                        console.log(error);
                        return api.sendMessage("Sorry, I couldn't find the ID from the Facebook link you provided...🤧\n Please use other options.", event.threadID)
                    }
 
                    if (linkUid) {
                        uid = linkUid
                    }
                } else {
                    message.reply("useless 🫵 it only works with mention, uid, fblink, or me");
                    return
                }
            } else if (replySenderId) {
                Message = input.trim();
                uid = replySenderId
            } else {
                message.reply(`Learn first how to use you idiot 🗿\n\nFollow :\n${p}Fakechat input | @tag or uid or fblink or me\n\nType :\n${p}help Fakechat\nto see how to use this..`);
                return
            }
 
            if (!Message) {
                message.reply(`Where is the message you assh*** 🐍\nlearn first then use fakechat\n\nExample: ${p}Fakechat Hello | @tag or uid or fblink or me`);
                return
            }
 
            const sexInfo = await api.getUserInfo([uid]);
            const xuser = sexInfo[uid];
            const sexname = xuser.name;
            if (protectedIds.includes(uid)) {
                if (event.senderID !== uid) {
                    message.reply(`${sexname}📢 :\n Everyone look Gay Detected 👇🏳‍🌈`);
                    uid = event.senderID;
                    Message = `Do you know im a Gay...!`
                }
            }
 
            const randomWords = ['gay', 'threesome', 'abal', 'nununai', 'bts'];
 
            function getRandomWord() {
                const randomIndex = Math.floor(Math.random() * randomWords.length);
                return randomWords[randomIndex]
            }
 
            let profileName;
            let profilePicUrl;
            try {
                const profileInfo = await api.getUserInfo([uid]);
                const user = profileInfo[uid];
                profileName = user.name;
                const nameWord = profileName.split(' ');
                if (nameWord.length === 1) {
                    profileName += ' ' + getRandomWord()
                }
 
                profilePicUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`
            } catch (error) {
                console.log(error);
                return api.sendMessage("Error with profile pic 🗿", event.threadID)
            }
 
            let apiUrl = `https://apis-samir.onrender.com/message?text= ${encodeURIComponent(Message)}&profileUrl=${encodeURIComponent(profilePicUrl)}&name=${encodeURIComponent(profileName)}`;
            const res = await fetch(apiUrl);
            if (!res.ok) {
                message.reply(` Something wants wrong 🐸`);
                return
            }
 
            const buffer = await res.buffer();
            const tag = Date.now();
            fs.writeFileSync(`${tag}.jpg`, buffer);
            message.reply({
                body: "",
                attachment: fs.createReadStream(`${tag}.jpg`),
            }, () => fs.unlinkSync(`${tag}.jpg`))
        } catch (err) {
            console.log(err);
            message.reply("Error 😪")
        }
    },
}