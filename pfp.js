module.exports = {
  config: {
    name: 'pfp',
    author: 'UPoL🐔',
    role: 0,
    longDescription: 'display users profile picture',
    guide: {
      en: '{pn}'
    }
  },
    onStart: async function ({ event, message, usersData, args, getLang }) {
      const getProfilePicture = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load profile picture');
  }
  const data = await response.json();
  return data.url;
};