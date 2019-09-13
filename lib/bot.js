const fs = require('fs');
const UserDatabase = require('./botdatabase.js');
const line = require('@line/bot-sdk');
const key = require('./lineKey');
const BotReplier = require('./botReplier');

const config = {
    channelAccessToken: key.getChannelAccessToken(),
    channelSecret: key.getChannelSecret()
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
        this.noWork = "Nggak ada";
        this.notComplete = "Kurang lengkap pak..";
        this.messageHeaderOld = `[JADWAL PH DAN REMEDIAL] \n\nBerikut jadwal PH & Remedial untuk minggu depan. Jadwalnya bisa di save ya temen-temen :)\n\nInfo:\n`;
        this.messageHeader = `[ INFO DAN PENUGASAN ]\n\n`;
        this.messageFooterOld = `\nnote: Jadwal bisa berubah sewaktu-waktu dan kemungkinan ada tambahan lagi.\n\nsekretarismu♥`
        this.messageFooter = `\nsekretarismu♥`

        // Global data
        this.client;
        this.currentEvent;
        this.currentDatabase = {};
        this.userdb = new UserDatabase();
        this.client2 = new line.Client(config);
        this.databaseReady = false;
        this.BotReplier = new BotReplier();
        // Focus mode
        this.focusedID;

        // Get subscribed User
        this.subscribedUser = this.userdb._getUserIDs();

        // Confirm database existence
        fs.existsSync('./database.txt', exists => {
            if (!exists) {
                this._setupNewDatabase();
            }
        });

        this.unparsedDatabase = fs.readFileSync('./database.txt', 'utf8');
        if (this.unparsedDatabase === '' || this.unparsedDatabase.length === 0) {
            this._setupNewDatabase();
            this.unparsedDatabase = undefined;
            return;
        }
        this.currentDatabase = JSON.parse(this.unparsedDatabase);
        this.unparsedDatabase = undefined;
    }

    _setupNewDatabase() {
        fs.writeFileSync('database.txt', JSON.stringify({}), 'utf8');
        this.currentDatabase = {};
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
    setGlobal(client, event) {
        this.client = client;
        this.event = event;
    }
    broadcastSchedule() {
        let schedule = this._processSchedule();
        if (schedule === this.noWork) return;

        // Broadcasting for maintenance
        // this.client2.broadcast(this._parseToMessage(schedule))Ua50d1de1758dbd83a9c950489320d; U7e499feb14aabb4a1833e389dfe5d72e;
        this.client2.pushMessage('Ua50d1de1758dbd83a9c950489320dbad', this._parseToMessage(schedule))
            .catch(err => {
            });
        this.client2.pushMessage('U7e499feb14aabb4a1833e389dfe5d72e', this._parseToMessage(schedule))
            .catch(err => {
            });

        schedule = undefined;
        return;
    }


    process(client, event) {
        // Set Environment Variables

        this.client = client;
        this.currentEvent = event;

        let message = this.currentEvent.message.text.toLowerCase();
        // The personal chat functionality
        let reply = this.BotReplier.process(this.currentEvent);
        console.log(reply);
        if (reply === 'botReplyJadwal') {
            this._respond('jadwal');
            return;
        }
        if (reply !== null) {
            this._sendTextMessage(reply);
            return;
        }

        // Identify command
        // if (!this._confirmCommand(message)) return;

        // let command = this._parseCommand(message);
        // if (command !== null) {
        //     this._respond(command);
        //     return;
        // };


    }

    _respond(command) {

        // Verfication
        if (command === 'jadwal') {
            // Send Schedule
            let schedule = this._processSchedule();
            // if (schedule === this.noWork) return;
            this._sendTextMessage(schedule);
            return;
        }

        if (this.currentEvent.source.groupId) {
            this._sendTextMessage("Personal Chat aja yaa..");
            return;
        }

    }



    _updateDatabase(newDatabase) {
        this.currentDatabase = newDatabase;
        fs.writeFileSync('database.txt', JSON.stringify(this.currentDatabase), 'utf8');
    }

    _returnDateAsNumber(date) {
        let compariton = 'Januari Februari Maret April May Juni Juli Agustus September Oktober November Desember'.split(' ');
        return compariton.indexOf(date);
    }

    _getTommorowDate(){
        let today = new Date();
        let tommorow = new Date();
        tommorow.setDate( today.getDate() + 1);
        today = undefined;

        let date = tommorow.toDateString().split(' ');
        let day = date.shift();
        tommorow = undefined;

        // Swap Month and Day
        let tmp = date[0];
        date[0] = date[1]
        date[1] = tmp;
        tmp = undefined;

        date[1] = this._parseToIndonesianMonth(date[1]);

        date.unshift(this.getIndonesianDay(day) + ',');

        date = date.join(' ');
        return date;
    }

    _processSchedule() {
        let deadlines = Object.keys(this.currentDatabase).sort((a, b) => {
            a = a.split(' ').map(Number);
            a.shift();

            b = b.split(' ').map(Number);
            b.shift();

            // The 10 multiplication is to signify how important is the factor
            let tmpCompare1 = parseInt(a[0]) + this._returnDateAsNumber(a[1]) * 10 + a[2] * 100;
            let tmpCompare2 = parseInt(b[0]) + this._returnDateAsNumber(a[1]) * 10 + b[2] * 100;

            return tmpCompare1 - tmpCompare2;
        });

        // Filter the database out here later on
        // deaadline.filter(code here)

        let schedule_limiter = this._getTommorowDate();
        let schedule_construct = [];
        let schedule_order = 1;

        // Construct schedule
        
        // New Construct
        deadlines.map(deadline => {
            console.log(deadline === schedule_limiter);
            if(deadline === schedule_limiter) {
                Object.keys(this.currentDatabase[deadline]).map(subject => {
                    if (subject !== 'Event') {
                        schedule_construct.push(`*${subject}`);
                    }
                    schedule_construct.push(`${this.currentDatabase[deadline][subject]}`);
                });
                schedule_construct.push(' ');
                schedule_order++;
            };
        });
        
        // Old construct
        // deadlines.map(item => {
        //     schedule_construct.push(`${schedule_order}. ${item}`);
        //     Object.keys(this.currentDatabase[item]).map(subject => {
        //         if (subject !== 'Event') {
        //             schedule_construct.push(`*${subject}`);
        //         }
        //         schedule_construct.push(`${this.currentDatabase[item][subject]}`);
        //     });
        //     schedule_construct.push(' ');
        //     schedule_order++;
        // });



        deadlines = undefined;
        schedule_construct = schedule_construct.flat();
        // Without footer alpha update
        // let schedule_constructComplete = this.messageHeader + schedule_construct.join('\n');
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
        // console.log(1);
        // Send Message
        let target = this.currentEvent.source.groupId || this.currentEvent.source.userId;
        this.client.pushMessage(target, this._parseToMessage(text))
            .catch(err => {
            });
        target = undefined;
    }


    _parseCommand(text) {
        //Returns the command
        let parsed = text.match(this.verify)[1];

        // Check Command Validity
        if (!this.commands.some(cmd => cmd === parsed)) {
            // Send error
            // this._sendTextMessage(this.commandError);
            return null;
        };

        return parsed;
    }

    _confirmCommand(text) {
        // Verify command
        return text.search(this.verify) !== -1;
    }
    _parseToIndonesianMonth(date) {
        switch (date) {
            case 'Jan':
                date = 'Januari'
                break;

            case 'Des':
                date = 'Desember'
                break;

            case 'Feb':
                date = 'Februari'
                break;

            case 'Mar':
                date = 'Maret'
                break;

            case 'Apr':
                date = 'April'
                break;

            case 'May':
                date = 'May'
                break;

            case 'Jun':
                date = 'Juni'
                break;

            case 'Jul':
                date = 'Juli'
                break;

            case 'Aug':
                date = 'Agustus'
                break;

            case 'Sep':
                date = 'September'
                break;

            case 'Oct':
                date = 'Oktober'
                break;

            case 'Nov':
                date = 'November'
                break;

            default:
                break;
        }
        return date;
    }

    getIndonesianDay(day) {
        switch (day) {
            case 'Sun':
                day = "Minggu";
                break;
            case 'Mon':
                day = "Senin";
                break;
            case 'Tue':
                day = "Selasa";
                break;
            case 'Wed':
                day = "Rabu";
                break;
            case 'Thu':
                day = "Kamis";
                break;
            case 'Fri':
                day = "Jumat";
                break;
            case 'Sat':
                day = "Sabtu";
        }
        return day;
    }

}

module.exports = Encharten;