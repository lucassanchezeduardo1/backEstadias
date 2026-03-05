
const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testDrive() {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

    console.log('Testing with:');
    console.log('Client ID:', clientId ? 'Found' : 'Missing');
    console.log('Token:', refreshToken ? 'Found' : 'Missing');

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
        console.log('Attempting to list files...');
        const res = await drive.files.list({
            pageSize: 5,
            fields: 'files(id, name)',
        });
        console.log('Success! Files found:', res.data.files.length);
        res.data.files.forEach(f => console.log(`- ${f.name} (${f.id})`));
    } catch (err) {
        console.error('Failure during list files:');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
    }
}

testDrive();
