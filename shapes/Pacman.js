class Pacman extends Sphere{
  constructor(gl, projectionMatrix, lightSource){
    super(gl, projectionMatrix, lightSource)
    this.materialAmbientColor = [222/255, 222/255, 16/255, 1.0]  
    this.materialDiffuseColor = [222/255, 222/255, 16/255, 1.0]
    this.materialSpecularColor = [1.0, 1.0, 1.0, 1.0]
    this.radius= 0.85
    this.initBuffers()
    this.facingDirection = PacmanFacingDirection.POSITIVE_Z
    this.isJumpingUp = false
    this.isFallingDown = false
    this.currentJumpHeight = 0
    // mouth-related variables:
    this.mouthSize = 0
    this.isMouthClosing = false
    // eyes:
    this.leftEye = null
    this.rightEye = null
    this.eyeToPacmanRatio = 0.2
    this.areEyesOnCorrectPosition = false
    // the eyes move together with the mouth (their Y and Z changing). Store the current offset due to mouth movement here:
    this.currentEyeYOffset = 0
    this.currentEyeZOffset = 0
    this.initEyes()
  }

  initEyes(){
    this.leftEye = new Sphere(gl, projectionMatrix, lightSource)
    this.leftEye.materialAmbientColor = [0.0, 0.0, 0.0, 1.0]
    this.leftEye.materialDiffuseColor = [0.0, 0.0, 0.0, 1.0]
    this.leftEye.scale(this.eyeToPacmanRatio)
    this.rightEye = new Sphere(gl, projectionMatrix, lightSource)
    this.rightEye.materialAmbientColor = [0.0, 0.0, 0.0, 1.0]
    this.rightEye.materialDiffuseColor = [0.0, 0.0, 0.0, 1.0]
    this.rightEye.scale(this.eyeToPacmanRatio)
    this.toggleEyePlacement()
  }

  toggleEyePlacement(){
    if(this.areEyesOnCorrectPosition){
      this.leftEye.translateY(-2.5 - this.currentEyeYOffset)
      this.leftEye.translateZ(-3.3 - this.currentEyeZOffset)
      this.leftEye.translateX(1.5)
      this.rightEye.translateY(-2.5 - this.currentEyeYOffset)
      this.rightEye.translateZ(-3.3 - this.currentEyeZOffset)
      this.rightEye.translateX(-1.5)
    } else {
      this.leftEye.translateY(2.5 + this.currentEyeYOffset)
      this.leftEye.translateZ(3.3 + this.currentEyeZOffset)
      this.leftEye.translateX(-1.5)
      this.rightEye.translateY(2.5 + this.currentEyeYOffset)
      this.rightEye.translateZ(3.3 + this.currentEyeZOffset)
      this.rightEye.translateX(1.5)
    }
    this.areEyesOnCorrectPosition = !this.areEyesOnCorrectPosition
  }

  moveMouth(){
    if(this.isMouthClosing){
      this.mouthSize -=0.02
      this.isMouthClosing = this.mouthSize >= 0.0
      this.leftEye.translateY(-0.1)
      this.leftEye.translateZ(0.08)
      this.rightEye.translateY(-0.1)
      this.rightEye.translateZ(0.08)
      this.currentEyeYOffset -= 0.1
      this.currentEyeZOffset += 0.08
    } else {
      this.mouthSize +=0.02
      this.leftEye.translateY(0.1)
      this.leftEye.translateZ(-0.08)
      this.rightEye.translateY(0.1)
      this.rightEye.translateZ(-0.08)
      this.currentEyeYOffset += 0.1
      this.currentEyeZOffset -= 0.08
      this.isMouthClosing = this.mouthSize >= 0.3
    }
    this.buffers.position.buffer = this.createPositionBuffer()
  }

  isPartOfMouthOpening(latitude, longitude){
    return latitude>this.latitudeCount*(0.6-this.mouthSize) && latitude<this.latitudeCount*0.6
          && longitude<this.longitudeCount*0.5
  }

  move(isCollidingWithWall){
    this.moveMouth()
    if(!isCollidingWithWall){
      this.translateZ(0.1)
      switch(this.facingDirection){
        case PacmanFacingDirection.NEGATIVE_Z: translateCameraZ(0.1); break;
        case PacmanFacingDirection.POSITIVE_Z: translateCameraZ(-0.1); break;
        case PacmanFacingDirection.NEGATIVE_X: translateCameraX(0.1); break;
        case PacmanFacingDirection.POSITIVE_X: translateCameraX(-0.1); break;
      }
    }
    if(this.isJumpingUp && this.currentJumpHeight < 2){
      this.currentJumpHeight += 0.1
      this.translateY(0.1)
      this.isFallingDown = this.currentJumpHeight >= 2
      this.isJumpingUp = !this.isFallingDown
    } else if(this.isFallingDown){
      this.currentJumpHeight -= 0.1
      this.translateY(-0.1)
      this.isFallingDown = this.currentJumpHeight >= 0
    }
  }

  createPositionBuffer(){
    // Just like the other shapes, the sphere also consists of a bunch of triangles.
    // We approximate the sphere using triangles. The more triangles we use, the bextter our approximation
    // We will express the vertices of our triangles in spherical coordinates, which we will map to normal cartesian coordinates
    // Spherical coordinates of a point consist of three values: 
    //    - the distance from the origin (radius)
    //    - theta, the polar angle
    //    - phi,  the azimuthal angle
    const positionBuffer = this.gl.createBuffer()
    let vertices = []
    for (let longitude = 0; longitude<=this.longitudeCount; longitude++){
      let phi = 2 * longitude * Math.PI / this.longitudeCount  // the azimuthal angle
      for (let latitude=0; latitude<=this.latitudeCount; latitude++){
        if(this.isPartOfMouthOpening(latitude,longitude)){
          vertices.push(0,0,0)
          continue
        }

        let theta = latitude * Math.PI / this.latitudeCount    // the polar angle (all points on the same latitude have the same polar angle)
        // map spherical coordinates (radius, theta, phi) to cartesian coordinates (x,y,z):
        let x = Math.cos(phi) * Math.sin(theta) * this.radius
        let y = Math.cos(theta) * this.radius
        let z = Math.sin(phi) * Math.sin(theta) * this.radius
        vertices.push(x, y, z)
      }
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW)
    return positionBuffer
  }

  turnForward(){
    switch(this.facingDirection){
      case PacmanFacingDirection.POSITIVE_Z: this.rotateY(Math.PI); break;
      case PacmanFacingDirection.NEGATIVE_X: this.rotateY(-Math.PI/2); break;
      case PacmanFacingDirection.POSITIVE_X: this.rotateY(Math.PI/2); break;
    }
    this.facingDirection = PacmanFacingDirection.NEGATIVE_Z
  }

  turnBackward(){
    switch(this.facingDirection){
      case PacmanFacingDirection.NEGATIVE_Z: this.rotateY(Math.PI); break;
      case PacmanFacingDirection.NEGATIVE_X: this.rotateY(Math.PI/2); break;
      case PacmanFacingDirection.POSITIVE_X: this.rotateY(-Math.PI/2); break;
    }
    this.facingDirection = PacmanFacingDirection.POSITIVE_Z
  }

  turnLeft(){
    switch(this.facingDirection){
      case PacmanFacingDirection.NEGATIVE_Z: this.rotateY(Math.PI/2); break;
      case PacmanFacingDirection.POSITIVE_Z: this.rotateY(-Math.PI/2); break;
      case PacmanFacingDirection.POSITIVE_X: this.rotateY(Math.PI); break;
    }
    this.facingDirection = PacmanFacingDirection.NEGATIVE_X
  }

  turnRight(){
    switch(this.facingDirection){
      case PacmanFacingDirection.NEGATIVE_Z: this.rotateY(-Math.PI/2); break;
      case PacmanFacingDirection.POSITIVE_Z: this.rotateY(Math.PI/2); break;
      case PacmanFacingDirection.NEGATIVE_X: this.rotateY(Math.PI); break;
    }
    this.facingDirection = PacmanFacingDirection.POSITIVE_X
  }

  jump(){
    if(this.isJumpingUp || this.isFallingDown){
      return
    }
    this.isJumpingUp = true
    this.isFallingDown = false
  }

  // typical shape transformations: they are applied as usual, with a minor exception in the case of Pacman:
  // the eyes must be transformed together with the body 
  rotateX(angleInRadians, isGlobal=false){
    super.rotateX(angleInRadians, isGlobal)
    this.toggleEyePlacement() // move eyes back to initial position (center of yellow sphere)
    this.leftEye.rotateX(angleInRadians, isGlobal)
    this.rightEye.rotateX(angleInRadians, isGlobal)
    this.toggleEyePlacement() // move them back where they were before
  }

  rotateY(angleInRadians, isGlobal=false){
    super.rotateY(angleInRadians, isGlobal)
    this.toggleEyePlacement() // move eyes back to initial position (center of yellow sphere)
    this.leftEye.rotateY(angleInRadians, isGlobal)
    this.rightEye.rotateY(angleInRadians, isGlobal)
    this.toggleEyePlacement() // move them back where they were before
  }

  rotateZ(angleInRadians, isGlobal=false){
    super.rotateZ(angleInRadians, isGlobal)
    this.toggleEyePlacement() // move eyes back to initial position (center of yellow sphere)
    this.leftEye.rotateZ(angleInRadians, isGlobal)
    this.rightEye.rotateZ(angleInRadians, isGlobal)
    this.toggleEyePlacement() // move them back where they were before

  }

  translateX(amount, isGlobal=false){
    super.translateX(amount, isGlobal)
    this.leftEye.translateX(amount*(1/this.eyeToPacmanRatio), isGlobal)
    this.rightEye.translateX(amount*(1/this.eyeToPacmanRatio), isGlobal)
  }

  translateY(amount, isGlobal=false){
    super.translateY(amount, isGlobal)
    this.leftEye.translateY(amount*(1/this.eyeToPacmanRatio), isGlobal)
    this.rightEye.translateY(amount*(1/this.eyeToPacmanRatio), isGlobal)
  }

  translateZ(amount, isGlobal=false){
    super.translateZ(amount, isGlobal)
    this.leftEye.translateZ(amount*(1/this.eyeToPacmanRatio), isGlobal)
    this.rightEye.translateZ(amount*(1/this.eyeToPacmanRatio), isGlobal)
  }

  draw(){
    super.draw()
    this.leftEye.draw()
    this.rightEye.draw()
  }

}