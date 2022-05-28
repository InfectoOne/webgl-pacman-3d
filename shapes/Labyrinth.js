class Labyrinth{
  constructor(gl, projectionMatrix, lightSource){
    this.floor = []
    this.balls = []
    this.walls = []
    let floorCube, ball, wallCube
    // generate labyrinth floor, edge walls and edible balls:
    for(let i=-8; i<=8; i++){
      for(let j=-8; j<=8; j++){
        floorCube = new Cube(gl, projectionMatrix, lightSource)
        floorCube.translateY(-2)
        floorCube.translateX(i*2)
        floorCube.translateZ(j*2)
        this.floor.push(floorCube)
        ball = new Sphere(gl, projectionMatrix, lightSource)
        ball.modelViewMatrix = mat4.clone(floorCube.modelViewMatrix)
        ball.translateY(2)
        ball.scale(0.2)
        this.balls.push(ball)
      }
    }
    // now that we generated the edible balls per floor cube (tile), 
    //we can replace the floor cubes with a single big surface
    floorCube = new Cube(gl, projectionMatrix, lightSource)
    floorCube.translateY(-2)
    floorCube.scaleX(16)
    floorCube.scaleZ(16)
    this.floor = [floorCube]

    // generate the other walls:
    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateX(6)
    wallCube.translateZ(4)
    wallCube.scaleZ(3)
    this.walls.push(wallCube)
    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(-2)
    wallCube.translateX(6)
    wallCube.scaleX(7)
    this.walls.push(wallCube)

    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(4)
    wallCube.scaleX(3)
    this.walls.push(wallCube)
    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(8)
    wallCube.translateX(4)
    wallCube.scaleX(9)
    this.walls.push(wallCube)
    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(12)
    wallCube.translateX(4)
    wallCube.scaleX(7)
    this.walls.push(wallCube)

    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(8)
    wallCube.translateX(-6)
    wallCube.scaleZ(3)
    this.walls.push(wallCube)
    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(-4)
    wallCube.translateX(-6)
    wallCube.scaleZ(7)
    this.walls.push(wallCube)

    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(-6)
    wallCube.translateX(2)
    wallCube.scaleX(5)
    this.walls.push(wallCube)
    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(-10)
    wallCube.translateX(2)
    wallCube.scaleX(3)
    this.walls.push(wallCube)

    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(-12)
    wallCube.translateX(6)
    wallCube.scaleZ(3)
    this.walls.push(wallCube)

    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(-12)
    wallCube.translateX(10)
    wallCube.scaleX(3)
    this.walls.push(wallCube)

    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateX(-10)
    wallCube.translateZ(4)
    wallCube.scaleZ(3)
    this.walls.push(wallCube)

    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateX(-10)
    wallCube.translateZ(-4)
    wallCube.scaleZ(3)
    this.walls.push(wallCube)

    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(-12)
    wallCube.translateX(-12)
    wallCube.scaleX(3)
    this.walls.push(wallCube)

    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(10)
    wallCube.translateX(-10)
    wallCube.scaleX(3)
    this.walls.push(wallCube)

    // edge walls:
    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateX(16)
    wallCube.scaleZ(17)
    this.walls.push(wallCube)
    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateX(-16)
    wallCube.scaleZ(17)
    this.walls.push(wallCube)
    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(-16)
    wallCube.scaleX(15)
    this.walls.push(wallCube)
    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(16)
    wallCube.scaleX(15)
    this.walls.push(wallCube)

    wallCube = new Cube(gl, projectionMatrix, lightSource)
    wallCube.translateZ(2)
    this.walls.push(wallCube)

    // we generated an edible ball for every floor tile. Then we created walls. Some of the balls are left inside
    // the walls. We delete those balls:
    this.balls = this.balls.filter(edibleBall => !this.walls.find(wall => edibleBall.isCollidingWithShape(wall)))
  }

  isPacmanCollidingWithWall(pacman){
    return !!this.walls.find(cubeWall => pacman.isCollidingWithShape(cubeWall))
  }

  removeBallsThatPacmanCollidesWith(pacman){
    let ballToBeEatenIndex = this.balls.findIndex(ball => ball.isCollidingWithShape(pacman))
    if(ballToBeEatenIndex != -1){
      wakka.play()
      this.balls.splice(ballToBeEatenIndex, 1) // delete the ball to be eaten
      document.querySelector("#score").innerHTML = ++score
    }
  }

  draw(){
    this.floor.forEach(floorCube => floorCube.draw())
    this.balls.forEach(ball => ball.draw())
    this.walls.forEach(wallCube => wallCube.draw())
  }
}