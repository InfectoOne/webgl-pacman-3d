var cameraMode = false
var shapes = []
var pacman = null
var lightSource = new PointLightSource()
var labyrinth = null
var gl = null
var bgMusic
var wakka
var score

function startGame(){
  cameraMode = false
  shapes = []
  pacman = null
  lightSource = new PointLightSource()
  labyrinth = null
  gl = null
  score = 0
  document.querySelector("#score").innerHTML = score
  document.querySelector("#startScreen").style.top = "-100vh"
  document.querySelector("#gameOverScreen").style.top = "-100vh";
  if(!!bgMusic){
    bgMusic.pause()
    bgMusic.currentTime = 0
  }
  bgMusic = new Audio("./assets/pacmanTheme.mp3")
  bgMusic.play()
  wakka = new Audio("./assets/wakka.mp3")
  play()
}

function play() {    
    // get a reference to our canvas and get it's WebGL context
    const canvas = document.getElementById("glCanvas")
    gl = canvas.getContext("webgl")
  
    if (!gl) {
      alert("It seems that your browser does not support WebGL")
      return;
    }
    // make the canvas drawing buffer's width and height match the actual width and height of the canvas:
    canvas.width = canvas.getBoundingClientRect().width
    canvas.height = canvas.getBoundingClientRect().height
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    
    // set canvas background color
    gl.clearColor(0, 28/255, 28/255, 1.0)   // dark cyan
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    initCamera()
    translateCameraZ(-10)
    rotateCameraX(1)
    labyrinth = new Labyrinth(gl, projectionMatrix, lightSource)
    shapes.push(labyrinth)
    pacman = new Pacman(gl, projectionMatrix, lightSource)
    shapes.push(pacman)
    requestAnimationFrame(draw)
}

function draw(now) {
  let isPacmanCollidingWithWall = labyrinth.isPacmanCollidingWithWall(pacman)
  if(!isPacmanCollidingWithWall && !pacman.isJumpingUp && !pacman.isFallingDown){
    labyrinth.removeBallsThatPacmanCollidesWith(pacman)
  }
  pacman.move(isPacmanCollidingWithWall)
  drawShapes()
  if(labyrinth.balls.length == 0){
    showGameOverScreen()
  } else {
    requestAnimationFrame(draw)
  }
}

function drawShapes(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  shapes.forEach(shape => {
    shape.draw()
  })
}

function showGameOverScreen(){
  document.querySelector("#gameOverScreen").style.top = 0
}

// listen to key inputs from user:
document.addEventListener("keydown", e => {
  switch(e.keyCode){

    case 37: // if pressed "arrow key left
      pacman.turnLeft()
      break

    case 38: // if pressed "arrow key top"
      pacman.turnForward()
      break

    case 39: // if pressed "arrow key right"
      pacman.turnRight()
      break

    case 40: // if pressed "arrow key down"
      pacman.turnBackward()
      break

    case 32: // if pressed space
      pacman.jump()
      break
    
  }
  drawShapes()
})

// prevents default behavior of space-bar (triggers the button last clicked)
document.addEventListener("keyup", (e) => e.preventDefault() )