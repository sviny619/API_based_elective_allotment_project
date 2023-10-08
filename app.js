const express = require('express')
const app = express()
const port = 3000
app.use(express.static("public"));
const Papa = require('papaparse');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const key = require('./credentials.json');
const nodemailer = require('nodemailer');

const obj = {}
const max_students_elec = {}
const roll_alloted = {}
const mail={}
const csv = []
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})
app.post('/load', function (req, res) {
  async function sendMail(user_mail,allloted_elective){
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'nvins619@gmail.com',
        pass: 'yasf jqgi hkra ailf', 
      },
    });
    
    const mailOptions = {
      from: 'nvins619@gmail.com',
      to: user_mail,
      subject: 'Elective_allootment',
      text: 'Thankyou for participating you have been alloted the Elective'+allloted_elective,
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
    
  }
  async function accessSpreadsheet() {
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    await jwtClient.authorize();

    const sheetsAPI = google.sheets({ version: 'v4', auth: jwtClient });

    const spreadsheetId = "1bb_-jtlXTJbe830n-_6FKVp4y05Iz_51dL-HPkWz-8w";
    const range = 'A2:H'; // Change to your desired range.

    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values;
    for (const row of values) {
      const studentID = row[3]; // Assuming student ID is always in the 4th column
      mail[studentID]=row[1]

      const subjects = row.slice(4); // Get subjects starting from the 5th column
      obj[studentID] = subjects;
    }
    const singlepoint = values[0]
    for (let i = 4; i < singlepoint.length; i++) { // Start from the 5th position
      const subject = singlepoint[i];
      max_students_elec[subject] = 50;
    }
    for (const i in obj) {
      for (const j of obj[i]) {
        if (max_students_elec[j] > 0) {
          roll_alloted[i] = j;
          sendMail(mail[i],j)
          max_students_elec[j]--;
          break;
        }
      }
    }
    console.log(mail)

    console.log(roll_alloted)
    // res.send("sucesfully posted")



  }
  accessSpreadsheet();




  // Send the CSV data to the client
  res.send("sucesfully posted!");



})

app.listen(3000, function () {
  console.log("running on port 3000")
})

