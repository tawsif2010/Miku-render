module.exports = {
	config: {
		name: "m",
		version: "1.2",
		author: "MD Tawsif",
		countDown: 5,
		role: 2,
		description: {
			vi: "Tag tất cả thành viên trong nhóm chat của bạn",
			en: "Tag"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} [nội dung | để trống]",
			en: "   {pn} [content | empty]"
		}
	},

	onStart: async function ({ message, event, args }) {
		const { participantIDs } = event;
		const lengthAllUser = participantIDs.length;
		const mentions = [];
		let body = args.join(" ") || "@tawsif";
		let bodyLength = body.length;
		let i = 0;
		for (const uid of participantIDs) {
			let fromIndex = 0;
  if (repliedToMessage) {
    messageText = `@${repliedToMessage.querySelector('.sender').textContent}: ${messageText}`;

			mentions.push({
				tag: body[i],
				id: uid, fromIndex
			});
			i++;
		}
		message.reply({ body, mentions });
	}
};