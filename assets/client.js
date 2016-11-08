var ws
function connect(){
    ws = new WebSocket(`ws://${location.host}`);
    ws.onclose = function(){
        //try to reconnect in 5 seconds
        setTimeout(connect, 1000);
    };
}

var promiseOnWSOpen = new Promise(function(resolve, reject) {
  connect()
  ws.onopen = function() {
    //var array = new Float32Array(5);

    //for (var i = 0; i < array.length; ++i) {
      //array[i] = i / 2;
    //}

    //ws.send(array, { binary: true, mask: true });
    console.log('WebSocket connected');
    resolve(ws)
  };
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data)
    var clientIP = data.body
    var iframe = document.createElement('iframe')
    iframe.src = `http://${clientIP}:8080/stream/webrtc`
    iframe.style.width = '100vw'
    iframe.style.height = '100vh'
    iframe.style.border = 0
    document.body.appendChild(iframe)
  }
})

var promiseOnGamepadConnected = new Promise(function(resolve, reject) {
  var gp = navigator.getGamepads()[0];
  if (gp) {
    return resolve(gp)
  }
  window.addEventListener("gamepadconnected", function(e) {
    var gp = navigator.getGamepads()[e.gamepad.index];
    resolve(gp)
  });
})
.then(function(gp) {
  console.log(
    "Gamepad connected at index %d: %s. %d buttons, %d axes.",
    gp.index,
    gp.id,
    gp.buttons.length,
    gp.axes.length
  );
  return gp
})

Promise.all([promiseOnWSOpen, promiseOnGamepadConnected])
.then(function(resources) {
  //var ws = resources[0]
  var gp = resources[1]
  var lastStatuses = {}
  lastStatuses.index    = gp.index
  lastStatuses.axes     = {}
  lastStatuses.buttons  = {}
  setInterval(function() {
    var _gp = navigator.getGamepads()[gp.index];
    if (!_gp) {
      return
    }
    var diff = {}
    for (var i = 0, l = _gp.axes.length; i < l; i++) {
      if (lastStatuses.axes[i] !== _gp.axes[i]) {
        diff.axes = diff.axes || {}
        diff.axes[i] = _gp.axes[i]
      }
    }
    lastStatuses.axes = _gp.axes

    for (var i = 0, l = _gp.buttons.length; i < l; i++) {
      if (!lastStatuses.buttons[i] ||
          lastStatuses.buttons[i].value !== _gp.buttons[i].value) {
        diff.buttons = diff.buttons || {}
        diff.buttons[i] = {}
        diff.buttons[i].pressed = _gp.buttons[i].pressed
        diff.buttons[i].value   = _gp.buttons[i].value
      }
      lastStatuses.buttons[i] = {}
      lastStatuses.buttons[i].pressed = _gp.buttons[i].pressed
      lastStatuses.buttons[i].value   = _gp.buttons[i].value
    }

    if (Object.keys(diff).length) {
      var data = JSON.stringify(diff)
      console.log(`sending data: ${data}`)
      ws.send(data)
    }
  }, 100)
})
