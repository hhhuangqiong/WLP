## Code Example

---->
  var Mailer = require('../mailer/index');
  var mailer = new Mailer({});
  router.get('/mailto/:email', function(req, res, next){
    var mailOptions = {
        subject: 'Hello world',
        from: 'nobody',
        to: req.params.email
    };
    var tmplName = 'example';
    var tmplData = {
        name: 'm800'
    };
    mailer.mail(mailOptions, tmplName, tmplData, function(err, response){
        if(err) {
          console.error(err);
          next(err);
        }
        else{
            res.send('email sent');
        }
    });
  })
<----

## Installation

> npm install

