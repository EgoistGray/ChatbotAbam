const fs = require('fs');

module.exports = class Database{
    constructor(filename){
        this.file = filename;

        this._databaseCheck();        

    }
    _databaseCheck(){
        // Checkfile
        if(!fs.existsSync(this.file)){
            this._writeToDatabase('{}');
        }
    }
    
    _writeToDatabase(text){
        fs.writeFileSync(this.file, text, 'utf8');
    }

    _readDatabase(){
        return fs.readFileSync(this.file, 'utf8');
    }
}