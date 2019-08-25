const fs = require('fs');
const UserDatabase = require('./botdatabase.js');
const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: "I1PVJRhv+bRjNe/3ZDmfnyQMsZbiwwEI6Ivz7RLI4h07JMOvx11UomfGzTV8H5aGOdJq+FKn+Qv3yJC7x7i2YYQ8toHkWNOGpMMauwcgbL83q6N9fFRwkpo2JWatE1RcEpXrMktJPkoTHgiA1MCf1gdB04t89/1O/w1cDnyilFU=",
    channelSecret: "4a1aabec3f52e7a60ba170a6d5d4182d"
}

class Encharten {
    constructor() {
        // Set basic information
        this.chatbotName = "abam";
        this.verify = /^abam\s(\w+)/;
        this.commands = 'tugas hapus jadwal'.split(' ');

        // Chats
        this.commandError = "Ngomong apa kau?!";
        this.confirmationText = ['Okk', 'Ashyiap!', 'Sipp'];
        this.noWork = "Kagak ada pr kok..";
        this.notComplete = "Kurang lengkap pak..";
        this.messageHeader = `[JADWAL PH DAN REMEDIAL] \n\nBerikut jadwal PH & Remedial untuk minggu depan (19-24 Agustus). Jadwalnya bisa di save ya temen-temen :)\n\n`;
        this.messageFooter = `\n\nnote: Jadwal bisa berubah sewaktu-waktu dan kemungkinan ada tambahan lagi.\n\nsekretarismu♥`

        // Global data
        this.client;
        this.currentEvent;
        this.currentDatabase = {};
        this.userdb = new UserDatabase();
        this.client2 = new line.Client(config);
        // Focus mode
        this.focusedID;

        // Get subscribed User
        this.subscribedUser = this.userdb._getUserIDs();

        // Confirm database existence
        fs.exists('./database.txt', exists => {
            if (!exists) {
                fs.writeFileSync('database.txt', JSON.stringify({}), 'utf8');
                this.currentDatabase = {};
            }
        });

        // Prepare Database
        fs.readFileSync('./database.txt', 'utf8', text => {
            if (text === '' && text.length === 0) {
                this._updateDatabase();
                return;
            };
            this.currentDatabase = JSON.parse(text);
        });
    }

    subscribe(id, client) {
        if (this.subscribedUser.indexOf(id) !== -1) return;
        this.subscribedUser.push(id);
        this.userdb._updateUserIDs(this.subscribedUser);
        return;
    }
    
    unsubscribe(id, client) {
        if (this.subscribedUser.indexOf(id) === -1) return;
        this.subscribedUser.splice(this.subscribedUser.indexOf(id), 1);
        this.userdb._updateUserIDs(this.subscribedUser);
        return;
    }
    setGlobal(client, event){
        this.client = client;
        this.event = event;
    }
    broadcastSchedule() {
        let schedule = this._processSchedule();
        if (schedule === this.noWork) return;

        this.client2.broadcast(this._parseToMessage(schedule));

        schedule = undefined;
        return;
    }

    process(client, event) {
        // Set Environment Variables

        this.client = client;
        this.currentEvent = event;

        // Identify command
        let message = this.currentEvent.message.text.toLowerCase();
        console.log(this._confirmCommand(message));
        if (!this._confirmCommand(message)) return;


        let command = this._parseCommand(message);
        if (command !== null) this._respond(command);
    }

    _respond(command) {

        // Verfication
        if (command === 'jadwal') {

            // Send Schedule
            let schedule = this._processSchedule();
            console.log(schedule);
            this._sendTextMessage(schedule);
            return;
        }

        if (this.currentEvent.source.groupId) {
            this._sendTextMessage("Personal Chat aja yaa..");
            return;
        }

    }

    _processDeletion() {
        let message = this.currentEvent.message.text.split(' ');
        message.splice(0, 2);
        if (message.length === 0) {
            this._sendTextMessage(this.notComplete)
            return;
        };
        let date = message.splice(2, 3);

        this.currentDatabase[date] = undefined;
        this._updateDatabase();

        this._sendTextMessage(this.confirmationText[2]);
        date = undefined;
        return;

    }

    _updateDatabase(newDatabase) {
        this.currentDatabase = newDatabase;
        fs.writeFileSync('database.txt', JSON.stringify(this.currentDatabase), 'utf8');
    }

    _processHomework() {
        // usage: abam tugas 27 April 2019 Fisika: main main
        let message = this.currentEvent.message.text.split(' ');
        console.log(message);
        message.splice(0, 2);
        if (message.length === 0) {
            this._sendTextMessage(this.notComplete)
            return;
        };
        let date = message.splice(0, 3).join(' ');

        console.log(1);
        console.log(message);

        if (this.currentDatabase[date] === undefined) {
            this.currentDatabase[date] = [];
        }

        this.currentDatabase[date].push(message.join(' '));
        this._sendTextMessage(this.confirmationText[2]);
        this._updateDatabase()
        return;
    }

    _processSchedule() {
        let schedule_construct = [];

        // Construct schedule
        Object.keys(this.currentDatabase).map(item => {
            schedule_construct.push(item);
            schedule_construct.push(this.currentDatabase[item]);
        });

        schedule_construct = schedule_construct.flat();
        let schedule_constructComplete = this.messageHeader + schedule_construct.join('\n') + this.messageFooter;

        return schedule_construct.length !== 0 ? schedule_constructComplete : this.noWork;
    }



    _parseToMessage(text) {
        return {
            type: 'text',
            text: text
        }
    }

    _sendTextMessage(text) {
        // Send Message
        let target = this.currentEvent.source.groupId || this.currentEvent.source.userId;
        this.client.pushMessage(target, this._parseToMessage(text))
            .catch(err => {
                console.log('ERROR');
                console.log(err);
            });
        target = undefined;
    }


    _parseCommand(text) {
        //Returns the command
        let parsed = text.match(this.verify)[1];

        // Check Command Validity
        if (!this.commands.some(cmd => cmd === parsed)) {
            // Send error
            console.log('ERROR!');
            // this._sendTextMessage(this.commandError);
            return null;
        };

        return parsed;
    }

    _confirmCommand(text) {
        // Verify command
        return text.search(this.verify) !== -1;
    }
}

module.exports = Encharten;