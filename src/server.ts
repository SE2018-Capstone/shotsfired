var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req: any, res: any){
  res.send('<h1>Bye world</h1>');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
