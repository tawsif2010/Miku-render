const axios = require('axios');
const fs = require('fs');

async function onStart({ api, event }) {
    const { threadID, messageID, type, messageReply, body } = event;
    let question = "";

    if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
        const attachment = messageReply.attachments[0];
        const imageURL = attachment.url;
        question = await convertImageToText(imageURL);

        if (!question) {
            api.sendMessage(
                "❌ Failed to convert the photo to text. Please try again with a clearer photo.",
                threadID,
                messageID
            );
            return;
        }
    } else {
        question = body.slice(5).trim();

        if (!question) {
            api.sendMessage("Please provide a question or query", threadID, messageID);
            return;
        }
    }

    try {
        const apiBaseUrl = 'https://news.orgasom.shop';
        const apiEndpoint = '/api.php';
        const apiUrl = ${apiBaseUrl}${apiEndpoint};

        console.log('API URL:', apiUrl);
        console.log('Question sent:', question);

        const response = await axios.get(apiUrl, { params: { question } });
        const responseData = response.data;

        let responseMessage;
        if (responseData.status === 'success') {
            responseMessage = responseData.answer;
        } else {
            responseMessage = responseData.message || "Sorry, an error occurred while fetching the answer.";
        }

        console.log('API response:', responseMessage);

        api.sendMessage({
            body: responseMessage
        }, threadID);
    } catch (error) {
        console.error('Error during the API request:', error);
        api.sendMessage(langs.en.error, threadID);
    }
}

const config = {
    name: "cat",
    version: "1.0",
    author: "Hridoy",
    role: 0, 
    shortDescription: {
        en: "Command to interact with the conversation eliana."
    },
    longDescription: {
        en: "Use the command by typing /eliana ask any question."
    },
    category: "Examples", 
    guide: {
        en: "eliana hi"
    }
};

const langs = {
    en: {
        error: "Sorry, an error occurred while communicating with the conversation AI."
    }
};

async function onReply({ api, event }) {
    const { threadID, messageReply } = event;

    if (messageReply) {
        const question = messageReply.body;

        try {
            const apiBaseUrl = 'https://news.orgasom.shop';
            const apiEndpoint = '/api.php';
            const apiUrl = ${apiBaseUrl}${apiEndpoint};

            console.log('API URL:', apiUrl);
            console.log('Question sent:', question);

            const response = await axios.get(apiUrl, { params: { question } });
            const responseData = response.data;

            let responseMessage;
            if (responseData.status === 'success') {
                responseMessage = responseData.answer;
            } else {
                responseMessage = responseData.message || "Sorry, an error occurred while fetching the answer.";
            }

            console.log('API response:', responseMessage);

            api.sendMessage({
                body: responseMessage
            }, threadID);
        } catch (error) {
            console.error('Error during the API request:', error);
            api.sendMessage(langs.en.error, threadID);
        }
    }
}

module.exports = {
    config,
    langs,
    onStart,
    onReply
};

async function convertImageToText(imageURL) {
    return "extracted text from image";
}