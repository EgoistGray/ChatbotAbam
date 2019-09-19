const {Client} = require('pg');
const { promisify } = require('util');

module.exports = class Database{
    constructor(){
        
        // SETUP HAS BEEN FINISHED
        this.updateCommand = `UPDATE "school-tasks" SET tasks = $1::text WHERE id=1`;
        this.getDatabaseCommand = `SELECT tasks FROM "school-tasks" LIMIT 1`;
        this.connectionString = process.env.DATABASE_URL;
        // this.connectionString = "postgres://ustiauhzwpybbr:1f23c1562b0f2b2ac676a15e77d817cc30e8439d54e3fc49393360b43b9a2bca@ec2-54-220-0-91.eu-west-1.compute.amazonaws.com:5432/d6pnnfbqoqs39j";
        this.client = new Client({
            connectionString : this.connectionString,
            ssl: true
        });
        this.client.connect();
        console.log('CONNECTED');
    }
    
    updateDatabase(text){
        console.log('UPDATE DATABASE');
        this.client.query(this.updateCommand, [text], (err, res) => {
            if(err) console.log(err);
            if(res) console.log('DATABASE UPDATED!');
        });
    }
    selectLatestDatabase(){
        return new Promise((resolve, reject) => {
            this.client.query(this.getDatabaseCommand, (err, res) => {
                console.log(res.rows, 'Query Result');
                resolve(res.rows[0].tasks);
                return;
            });
        })
        
    }
}