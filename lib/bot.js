const fs = require('fs');

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

        // Global data
        this.client;
        this.currentEvent;
        this.currentDatabase = {};

        // Focus mode
        this.focusedID;

        // Confirm database existence
        fs.exists('./database.txt', exists => {
            if (!exists) {
                fs.writeFileSync('database.txt', JSON.stringify({}), 'utf8');
                this.currentDatabase = {};
            }
        });

        // Prepare Database
        fs.readFileSync('./database.txt', 'utf8', text => {
            if(text === '' && text.length === 0) {
                this._updateDatabase();
                return;
            };
            this.currentDatabase = JSON.parse(text);
        });
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
        
        if(this.currentEvent.source.groupId){
            this._sendTextMessage("Personal Chat aja yaa..");
            return;
        }

        if (command === 'tugas' && !this.currentEvent.source.groupId) {
            this._processHomework();
        }
        if (command === 'hapus' && !this.currentEvent.source.groupId) {
            this._processDeletion();
        }
    }

    _processDeletion(){
        let message = this.currentEvent.message.text.split(' ');
        message.splice(0,2);
        if(message.length === 0) {
            this._sendTextMessage(this.notComplete)
            return;
        };
        let date = message.splice(2,3);

        this.currentDatabase[date] = undefined;
        this._updateDatabase();
        
        this._sendTextMessage(this.confirmationText[2]);
        date = undefined;
        return;
        
    }

    _updateDatabase() {
        fs.writeFileSync('database.txt', JSON.stringify(this.currentDatabase), 'utf8');
    }

    _processHomework() {   
        // usage: abam tugas 27 April 2019 Fisika: main main
        let message = this.currentEvent.message.text.split(' ');
        console.log(message);
        message.splice(0,2);
        if(message.length === 0) {
            this._sendTextMessage(this.notComplete)
            return;
        };
        let date = message.splice(0,3).join(' ');

        console.log(1);
        console.log(message);

        if(this.currentDatabase[date] === undefined){
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
        console.log(this.currentDatabase);
        Object.keys(this.currentDatabase).map(item => {
            schedule_construct.push(item);
            schedule_construct.push(this.currentDatabase[item]);
        });
        
        schedule_construct.flat();
        console.log(1);
        console.log(schedule_construct);

        return schedule_construct.length !== 0 ? schedule_construct.join('\n') : this.noWork;
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
            this._sendTextMessage(this.commandError);
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