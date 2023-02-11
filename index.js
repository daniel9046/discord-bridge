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
            existingChannel.delete(); mppClient.stop(); 
        } else { 
            message.channel.send("@"+message.author.tag+" invalid channel."); 
        }
    }
    if (message.content.startsWith("!bridge")) {
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
                            mppClient.start();
                            mppClient.on('hi', message => {
                                mppClient.setChannel(channelName)
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

        message.attachments.forEach((attachment) => {
            messageContent += `\n${attachment.url}`;
        });

        mppClient.sendArray([
            { m: "a", message: `[DISCORD]: ${message.author.tag}: ${messageContent}` }
        ]);
    }
});
mppClient.on("ch", msg => {
    console.log(msg)
    cname = msg.ch._id
})
mppClient.on("a", (mppMessage) => {
    if (mppMessage.a.includes("@everyone")) {
        mppMessage.a = mppMessage.a.replace("@everyone", "@ever yone");
    }
    if (mppMessage.a.includes("@here")) {
        mppMessage.a = mppMessage.a.replace("@here", "@he re");
    }
    if(mppMessage.p.id == mppClient.getOwnParticipant().id) return;
    const channel = client.channels.cache.find(channel => channel.name === cname.replace(" ", "-"))
    channel.send(`[${mppMessage.p.id}] ${mppMessage.p.name}: ${mppMessage.a}`)
});

client.login("OTg5NTkzMzU1OTU4NzY3NjE2.GhHM3o.pWiW8VLPzdj5QqPrAU3lsIZdWWBAoPF7_KsOww");
