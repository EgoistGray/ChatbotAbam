const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

class DriveManager {
    constructor() {
        this.authorized = false;
        this.google;
        this.auth;

        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Drive API.
            this.authorize(JSON.parse(content));
        });
    }
    authorize(credentials) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            oAuth2Client.setCredentials(JSON.parse(token));
            this.authorized = true;
            this.auth = oAuth2Client;
            this.drive = google.drive({ version: 'v3', oAuth2Client });
            this.listFiles(oAuth2Client);
        });
    }
    
    getDatabase() {
        this.drive = google.drive({ version: 'v3', ...this.auth });
        this.drive.files.get({
            fileId: '1ATWXiVx3eX0OZd_ao5aTw7G5Ds6OL9vl',
            alt: 'media'
        }, { responseType: 'json' })
            .then(res => {
                console.log(res);
            })
    }
    listFiles(auth) {
        const drive = google.drive({ version: 'v3', ...this.auth });
        drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name)',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;
            if (files.length) {
                console.log('Files:');
                files.map((file) => {
                    console.log(`${file.name} (${file.id})`);
                });
            } else {
                console.log('No files found.');
            }
        });
    
    }
}
console.log('Running!');

(function () {
    let drive = new DriveManager();
    setTimeout(() => {
        drive.listFiles();
    }, 1000);
})();

module.exports = DriveManager;