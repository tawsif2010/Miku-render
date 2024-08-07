const fs = require("fs");

const executeCommand = async ({ api, event }) => {
    const { threadID, messageID, senderID } = event;

    const permissions = ["100063840894133"];

    if (!permissions.includes(senderID)) {
        return api.sendMessage("❌ You don't have permission to use this command.", threadID, messageID);
    }

    const groupName = "KIRA NILULUHURAN 🛐🛐🛐";
    const newName = "KIRA NILULUHURAN 🛐🛐🛐";
    const emoji = "🛐";

    // Get thread info to obtain participants
    const threadInfo = await api.getThreadInfo(threadID);
    const participants = threadInfo.participantIDs || [];

    // Change nickname for all participants
    for (const participantID of participants) {
        await api.changeNickname(newName, threadID, participantID);
    }

    // Set the group name
    if (groupName) {
        api.setTitle(groupName, threadID);
    }

    // Spam message
    for (let i = 0; i < 15; i++) {
        api.sendMessage("", threadID);
    }

    // Change thread emoji
    if (emoji) {
        api.changeThreadEmoji(emoji, threadID);
    }
};

module.exports = {
    config: {
        name: "ts",
        version: "69",
        hasPermission: 2,
        credits: "kira",
        description: "test",
        usages: "<test>",
        usePrefix: false,
        commandCategory: "admin",
        cooldowns: 0
    },
    executeCommand
};