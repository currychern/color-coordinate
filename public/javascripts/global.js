/* VARIABLES
------------------------------------------------------------------------------*/
var default_color = '#640064'
var light_color = '#FFFFFF'
var light_color_2 = '#CCCCCC'
var dark_color = '#000000'
var dark_color_2 = '#333333'

var socket = io()

/* DOM Events
------------------------------------------------------------------------------*/
$(document).ready(function() {
  luminance()
  inputHandlers()
})

$(document).keyup(function(e) {
  // 'p' key pressed
  if (e.keyCode == 80) {

    $('.pos').toggleClass('pause')

    var paused = $('.pos').hasClass('pause')
    var inside = $('body').hasClass('inside')

    if (paused) {
      $('.state').text('paused.')
      emitColorPos('stop')
    }
    else if (!inside) {
      $('.state').text('scanning...')
      emitColorPos('start')
    }
    else {
      $('.state').text('')
    }
  }
})

$(document).mouseleave(function() {
  $('body').toggleClass('inside')

  var paused = $('.pos').hasClass('pause')
  if (!paused) {
    $('.state').text('scanning...')
    emitColorPos('start')
  }

  socket.on('robotInfo', function(x, y, color) {
    outputRobotInfo(x, y, color)
  })

})

$(document).mouseenter(function() {
  $('body').toggleClass('inside')

  var paused = $('.pos').hasClass('pause')
  if (!paused) {
    $('.state').text('')
    emitColorPos('stop')
  }
})

/* IO Events
------------------------------------------------------------------------------*/
function emitColorPos(type) {
  switch(type) {
    case 'start':
      socket.emit('startColorPos')
      break
    case 'stop':
      socket.emit('stopColorPos')
      break
  }
}

function outputRobotInfo(x, y, robotColor) {
  // Set hex value
  var hex = '#' + robotColor.toUpperCase()
  $('#hex').val(hex)

  // Set rgb value and background color
  var color = hexToRgb(hex)
  $('#rgb').val(color.m)
  $('body').css('background-color', color.m)

  $('.pos').text(x + ', ' + y)
  // Set text color based on background color
  luminance()
}

/* Event Handlers
------------------------------------------------------------------------------*/
function inputHandlers() {
  var hex = $('#hex')
  var rgb = $('#rgb')

  hex.on('input', () => {
    var color = hexToRgb(hex.val())

    if (color) {
      rgb.val(color.m)
      $('body').css('background-color', color.m)
    }
    else {
      rgb.val('')
      $('body').css('background-color', default_color)
    }

    luminance()

    $('.pos').text('')

  })

  rgb.on('input', () => {
    var color = rgbToHex(rgb.val())

    if (color) {
      hex.val(color.m)
      $('body').css('background-color', color.m)
    }
    else {
      hex.val('')
      $('body').css('background-color', default_color)
    }

    luminance()

    $('.pos').text('')
  })
}

/* Functions
------------------------------------------------------------------------------*/

// Accepts a hex color string and returns the rgb string value, returns null if
// the input is not a valid hex color
function hexToRgb(hex) {
  // Expand shorthand hex to full 6 character form 'AE0' => 'AAEE00'
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b
  })

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    m: 'rgb(' + parseInt(result[1], 16) + ',' +
                      parseInt(result[2], 16) + ',' +
                      parseInt(result[3], 16) + ')',
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Accepts a rgb color string and returns the hex string value, returns null if
// the input is not a valid rgb color
function rgbToHex(rgb) {
  // Strips the superfluous rgb() text 'rgb(100,0,0)' => 100,0,0
  var stripRegex = /^rgb\((.*)\)$/i
  rgb = rgb.replace(stripRegex, (m, s) => { return s })

  var result = /^(\d{1,3}),(\d{1,3}),(\d{1,3})$/i.exec(rgb)

  if (!result)
    return null

  return (result[1] < 256 && result[2] < 256 && result[3] < 256) ? {
    m: ('#' + componentToHex(result[1]) +
             componentToHex(result[2]) +
             componentToHex(result[3])).toUpperCase(),
    r: componentToHex(result[1]),
    g: componentToHex(result[2]),
    b: componentToHex(result[3])
  } : null
}

// Takes a component of an rgb string and returns the hex value '255' => 'FF'
function componentToHex(c) {
  var hex = parseInt(c).toString(16)
  return hex.length == 1 ? "0" + hex : hex
}

// Determines whether to apply light or dark text based on the luminace of the
// background
function luminance() {
  var rgb = $('body').css('background-color').replace(/\s/g, '')
  var result = /^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/i.exec(rgb)
  rgb = { m: result[0], r: result[1], g: result[2], b: result[3] }

  var luma = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b // per ITU-R BT.709

  if (luma < 100) {
    $('body').removeClass('body-dark')
    $('input').removeClass('input-dark')

    $('body').addClass('body-light')
    $('input').addClass('input-light')
  }
  else {
    $('body').removeClass('body-light')
    $('input').removeClass('input-light')

    $('body').addClass('body-dark')
    $('input').addClass('input-dark')
  }
}
