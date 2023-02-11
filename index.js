const Discord = require("discord.js");
const client = new Discord.Client()
const Client = require("./Client");
const mppClient = new Client("wss://mppclone.com:8443","dc935201b29bcc39c3411d45.228a6045-d3cd-4552-8eea-7d6fdebf30f0");

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (message) => {
    if (message.author.bot) return;
    let channelName = message.content.split(" ").slice(1).join(" ");
    if(message.content.startsWith("!unbridge")) {
        if (!channelName) {
            return message.reply("Please specify the channel name.");
        }
        let existingChannel = message.guild.channels.cache.find(
            (channel) => channel.name === channelName
        );
        if(existingChannel) { 
            mppClient.say("Unbridging.")
            existingChannel.delete(); 
            mppClient.stop(); 
        } else { 
            message.channel.send("@"+message.author.tag+" invalid channel."); 
        }
    }
    if (message.content.startsWith("!bridge")) {
        let category = message.guild.channels.cache.find(c => c.name == "bridges" && c.type == "category")
        if (!channelName) {
            return message.reply("Please specify the channel name.");
        }

        let existingChannel = message.guild.channels.cache.find(
            (channel) => channel.name === channelName
        );

        if (existingChannel) {
            existingChannel
                .delete()
                .then(() => {
                    message.guild.channels
                        .create(channelName, { type: "text" })
                        .then((channel) => {
                            if (category && channel) channel.setParent(category.id);
                            mppClient.start();
                            mppClient.on('hi', message => {
                                mppClient.setChannel(channelName)
                                mppClient.setName("[discord.gg/g5DvrEATnr]")
                                mppClient.say("Bridging.")
                                cname = channelName
                            })
                        })
                        .catch((error) => {
                            console.error(error);
                            message.reply("Error creating the channel.");
                        });
                })
                .catch((error) => {
                    console.error(error);
                    message.reply("Error deleting the existing channel.");
                });
        } else {
            message.guild.channels
                .create(channelName, { type: "text" })
                .then((channel) => {
                    mppClient.start();
                    mppClient.on('hi', message => {
                        mppClient.setChannel(channelName)
                    })
                })
                .catch((error) => {
                    console.error(error);
                    message.reply("Error creating the channel.");
                });
        }
    } else {
        let messageContent = message.content;
        if(message.channel.name !== cname.replaceAll(" ", "-")) return;
        message.attachments.forEach((attachment) => {
            messageContent += ` ${attachment.url} `;
        });
        if(messageContent.startsWith("!cmd")) { 
            mppClient.sendArray([
                { m: "a", message: "⤹"+message.author.tag }
            ])
            mppClient.sendArray([
                { m: "a", message: `${message.content.split(" ").slice(1).join(" ")}` }
            ])
        } else {
            mppClient.sendArray([
                { m: "a", message: `[DISCORD]: ${message.author.tag}: ${messageContent}` }
            ]);
        }
    }
});
mppClient.on("ch", msg => {
    cname = msg.ch._id
})
mppClient.on("a", (mppMessage) => {
    if (mppMessage.a.includes("||")) mppMessage.a.replaceAll("||", "\|\|");
    if (mppMessage.a.includes("@everyone")) {
        mppMessage.a = mppMessage.a.replaceAll("@everyone", "`@ everyone`");
    }
    if (mppMessage.a.includes("@here")) {
        mppMessage.a = mppMessage.a.replaceAll("@here", "`@ here`");
    }
    if(mppMessage.p.id == mppClient.getOwnParticipant().id) return;
    const channel = client.channels.cache.find(channel => channel.name === cname.replaceAll(" ", "-"))
    channel.send(`[${mppMessage.p.id}] ${mppMessage.p.name}: ${mppMessage.a}`)
});

client.login("OTg5NTkzMzU1OTU4NzY3NjE2.GhHM3o.pWiW8VLPzdj5QqPrAU3lsIZdWWBAoPF7_KsOww");
