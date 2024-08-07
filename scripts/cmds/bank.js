const fs = require("fs");

module.exports = {
config: {
		name: "bank",
		version: "1.9",
		author: "Upol",
    countDown: 10,
		role: 0,
		shortDescription: {
			vi: "",
			en: "virtual bank system"
		},
		longDescription: {
			vi: "",
			en: "full bank system"
		},
		category: "economy",
		guide: {
			vi: "",
			en: "{pn} [transfer | withdraw | show | deposit | interest]\nbank transfer (amount) (uid of who you want to transfer) without ()\nbank interest:get interst.\nbank show: show money of your account.\nbank deposit (amount of your money)\nbank withdraw (amount of money)\nbank top: shows top richest users"
		}
},

  onStart: async function ({ args, message, event, usersData }) {
    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const bankData = JSON.parse(fs.readFileSync("bank.json", "utf8"));

    if (!bankData[user]) {
       bankData[user] = { bank: 0, lastInterestClaimed: Date.now() };
      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });
    }

    const command = args[0];
    const amount = parseInt(args[1]);
    const recipientUID = parseInt(args[2]);

if (command === "top") {
  const topTen = Object.entries(bankData).sort((a, b) => b[1].bank - a[1].bank).slice(0, 10);
  const messageText = "🏆Top 10 Richest🏆\nSeason 2\n\n\n" +
    (await Promise.all(
      topTen.map(async ([userID, data], index) => {
        const userData = await usersData.get(userID);
        return `${index + 1}. ${userData.name}:\n    Bal: $${data.bank}`;
      })
    )).join("\n\n");
  return message.reply(messageText);
}


    if (command === "deposit") {
      if (isNaN(amount) || amount <= 0) {
        return message.reply("Please enter the amount you wish to deposit in the bank.");
      }
      if (userMoney < amount) {
        return message.reply("You don't have enough money.");
      }

      bankData[user].bank += amount;
      await usersData.set(event.senderID, {
        money: userMoney - amount
      });

      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });
      return message.reply(`${amount} $ has been deposited into your bank account.`);
    } else if (command === "withdraw") {
      const balance = bankData[user].bank || 0;

      if (isNaN(amount) || amount <= 0) {
        return message.reply("Please enter the amount you wish to withdraw from your bank account.");
      }

      if (amount > balance) {
        return message.reply("The amount you want to withdraw is not available in your bank account.");
      }

      bankData[user].bank = balance - amount;
      const userMoney = await usersData.get(event.senderID, "money");
      await usersData.set(event.senderID, {
        money: userMoney + amount
   });
       fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;

      });



      return message.reply(`${amount} $ has been withdrawn from your bank account.`);

    } else if (command === "show") {

      const balance = bankData[user].bank !== undefined && !isNaN(bankData[user].bank) ? bankData[user].bank :0;

  return message.reply(`Your bank account balance is ${balance} $.`);

} else if (command === "interest") {

  const interestRate = 0.001; 

  const lastInterestClaimed = bankData[user].lastInterestClaimed || Date.now();

  const currentTime = Date.now();



 

  const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;



  

  const interestEarned = bankData[user].bank * (interestRate / 365) * timeDiffInSeconds;


bankData[user].lastInterestClaimed = currentTime;

  bankData[user].bank += interestEarned;



  fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {

    if (err) throw err;

  });
  return message.reply(`Interest has been added to your bank account balance. The interest earned is ${interestEarned.toFixed(2)} $.`);
        } else if (command === "transfer") {
  const balance = bankData[user].bank || 0;
  if (isNaN(amount) || amount <= 0) {
    return message.reply("Please enter the amount you wish to transfer to the recipient.");
  }
  if (balance < amount) {
    return message.reply("The amount you wish to transfer is greater than your bank account balance.");
  }
  if (isNaN(recipientUID)) {
    return message.reply("Please enter the correct recipient ID.");
  }
  if (!bankData[recipientUID]) {
    bankData[recipientUID] = { bank: 0, lastInterestClaimed: Date.now() };
    fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
      if (err) throw err;
    });
  }
  bankData[user].bank -= amount;
  bankData[recipientUID].bank += amount;
  fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
    if (err) throw err;
  });
  return message.reply(`${amount} converted to the recipient with id ${recipientUID}.`);
} else {
  return message.reply("──────⊱MIKU BANK⊰─────\n❏The following services available are:\n\n✧–Bank deposit\nput money into the bank.\n\n✧–Bank withdraw\nwithdraw money from your account.\n\n✧–Bank show\nshow the amount of your bank account.\n\n✧–Bank interest\nyou get good interest.\n\n✧–Bank transfer [amount] [uid]\nto transfer your money to other users.\n\n✧–Bank top\nview the top 10 richest users in the bank");
} 
}
};