var express = require('express')
var stylus = require('stylus')
var nib = require('nib')

var app = express()
var favicon = require('serve-favicon')
app.use(favicon(__dirname + '/public/assets/favicon.ico'))

var server = require('http').Server(app)
var io = require('socket.io')(server)
var robot = require('robotjs')

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(stylus.middleware(
  { src: __dirname + '/public', compile: compile }
))
app.use(express.static(__dirname + '/public'))

app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io-client/'))

app.get('/', function (req, res) {
  res.render('index', { title : 'Color Coordinate' })
})

io.on('connection', function(socket) {
  var timer

  socket.on('startColorPos', function() {
    timer = setInterval(() => {
      mouse = robot.getMousePos()
      socket.emit('robotInfo', mouse.x, mouse.y, robot.getPixelColor(mouse.x, mouse.y))
    }, 500)
  })

  socket.on('stopColorPos', function() {
    clearInterval(timer)
  })
})

server.listen(3000, function() {
  console.log('Example app listening on port 3000!');
})
