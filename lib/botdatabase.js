const Database = require('./database.js');
const fs = require('fs');

class UserDatabase extends Database{

    constructor(){
        super('userid.txt');
    }

    _databaseCheck(){
        if(!fs.existsSync(this.file)){
            this._writeToDatabase(JSON.stringify({ids:[]}));
        }
    }

    _updateUserIDs(arrayId){
        this._writeToDatabase(JSON.stringify({ids: arrayId}));
        return 1;
    }

    _getUserIDs(){
        return JSON.parse(this._readDatabase()).ids;
    }
    
}

module.exports = UserDatabase;