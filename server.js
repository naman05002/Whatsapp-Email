require('dotenv').config({path: `${__dirname}/twilio.env`});

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

// Parse URL-encoded bodies (as sent by HTML forms)

const port = process.env.PORT||3000;
// console.log(process.env)
const { ImapFlow } = require('imapflow');

const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();


app.get('/', (req, res) => {
    res.send('Hello World  !');
  });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
  }); 
  
app.use(bodyParser.urlencoded({extended: true}));

var Compose = false;
var mailRecieve = false;
var subjRecieve = false;
var bodyRecieve = false;

var subject;
var sendtomail;
var mailBody;

app.post('/sms', (req, res) => {
var incmess = req.body.Body;
  
const twiml = new MessagingResponse();
if(Compose==false&&mailRecieve==false&&subjRecieve==false&&incmess!='Check'&&incmess!='Compose'){
    twiml.message(`*Welcome to Whatsapp Emailer* \n -Type *Check* to check your last 5 emails\n -Type *Compose* to send a email from your account`);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
}

if(Compose==false&&mailRecieve==false&&subjRecieve==false&&incmess=='Check'){

    const client = new ImapFlow({
        host: 'imap.gmail.com',
        port : 993,
        secure: true,
        auth: {
            user: 'naman05002@gmail.com',
            pass: 'tbskgxeozwejyyft'
        }
    });
    const main =  async () => {
    await client.connect();
    var cde=``;
    let lock = await client.getMailboxLock('INBOX');
    try{

    let message =await client.fetchOne(client.mailbox.exists, {source: true});
    // console.log(message.source.toString());
    // console.log('\n\n');
    let staus = await client.status('INBOX', {messages:true});
    var num = staus.messages;


    for await (let message of client.fetch(`${num-4},${num-3},${num-2},${num-1},${num}`, {envelope: true})){

        cde+= `\n *From*:\n ${message.envelope.from[0].address}\n *Subject*:\n ${message.envelope.subject} \n\n`;
        console.log(`\n*** *${message.uid}* : *${message.envelope.subject}* **\n`);

    }
        
        twiml.message(`You Last E-Mails are - \n ${cde}`);

        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());

    
} finally {
    lock.release();
}
await client.logout();
};
main().catch(err => console.error(err));
}
else if(incmess=='Compose'){
    Compose = true;
    
    twiml.message(`Enter the email id of recipient`);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
}
else if(Compose==true){
    mailRecieve = true;
    sendtomail = incmess;
    twiml.message(`Enter the Subject of Mail`);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
    Compose=false;
}
else if(mailRecieve==true){
    subjRecieve = true;
    subject = incmess;
    twiml.message(`Enter the Body of Mail`);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
    mailRecieve=false;
}
else if(subjRecieve==true){
    bodyRecieve=true;
    subjRecieve=false;
    mailBody = incmess;
    var messageObj = {
        from: 'naman05002@gmail.com',
        to: sendtomail,
        subject: subject,
        text: mailBody
    };
    // const sendm = ()=> {
        
    // let info = await transporter.sendMail(messageObj);
    // console.log(`Message sent: ${info.messageId}`);
    
   
    // }
    let mailOptions = {
        from: 'naman05002@gmail.com',
        to: sendtomail,
        subject: subject,
        text: mailBody,
      };
    
      transporter.sendMail(mailOptions, (err,data) => {
        if (err) {
            twiml.message(`Mail Not Sent, Please try again...`);
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
          } else {
            twiml.message(`Email sent successfully - \n *To* - ${messageObj.to}\n *Subject* - ${messageObj.subject} \n *Text* - ${messageObj.text} `);
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
            console.log("Email sent successfully");
          }
      });

    
        
    

    
    subjRecieve==false;
}




});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
// http.createServer(app).listen(3000, () => {
//   console.log('Express server listening on port 3000');
// });