const http = require('http');
const express = require('express');
const port = process.env.PORT||3000;
console.log(process.env)
const { ImapFlow } = require('imapflow');

const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();
app.get('/', (req, res) => {
    res.send('Hello World  !');
  });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const client = new ImapFlow({
    host: 'imap.gmail.com',
    port : 993,
    secure: true,
    auth: {
        user: 'naman05002@gmail.com',
        pass: 'tbskgxeozwejyyft'
    }
});

  



app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();
  var x;
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
        

        for await (let message of client.fetch(`${num-4}:${num}`, {envelope: true})){
            cde+= `\n *From*:\n ${message.envelope.from[0].address}\n *Subject*:\n ${message.envelope.subject} \n\n`;
            console.log(`\n*** *${message.uid}* : *${message.envelope.subject}* **\n`);
            // console.log('\n\n');
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


});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
// http.createServer(app).listen(3000, () => {
//   console.log('Express server listening on port 3000');
// });