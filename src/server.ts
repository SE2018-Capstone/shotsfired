var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);

app.use(express.static(__dirname));
app.get('/', function(req: any, res: any){
  res.sendFile(path.resolve(__dirname, './index.html'));
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
