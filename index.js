var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var mailchimpInstance = 'us16';
var listId = '711faee3b6';
var mailchimpApiKey = '79b231cd0e325a49ecf12e4d9e52a304-us16';

app.post('/signup', function (req, res) {
    request
        .post('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listId + '/members/')
        .set('Content-Type', 'application/json;charset=utf-8')
        .set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey ).toString('base64'))
        .send({
          'email_address': req.body.emailInput,
          'status': req.body.newsletter,
          'merge_fields': {
            'FNAME': req.body.FName,
            'LNAME': req.body.LName
          }         
    })
    .end(function(err, response) {
      if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
        res.send('Signed Up!');
      } else {
        res.send("FAIL");
      }
  });
});
