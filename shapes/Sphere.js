class Sphere extends Shape{

  /* ============================================================================== */
  /* ========================== BASIC SCAFFOLDING METHODS ========================== */
  /* ============================================================================== */
  constructor(gl, projectionMatrix, lightSource){
    super(gl, projectionMatrix, lightSource)
    this.latitudeCount = 35 // how many horizontal "stripes" the sphere will consist of
    this.longitudeCount = 35 // how many vertical "stripes" the sphere will consist of
    this.radius = 1
    this.materialAmbientColor = [0.8, 0.0, 0.0, 1.0]  
    this.materialDiffuseColor = [0.8, 0.0, 0.0, 1.0]
    this.materialSpecularColor = [1.0, 1.0, 1.0, 1.0]
    this.initBuffers()
  }

  initBuffers(){
    // buffers are simply arrays that are filled with some values that may represent position, colors etc.
    this.buffers = {
      position: {
        buffer: this.createPositionBuffer(),
        numOfComponents: 3,   // indicates that 3 values per iteration shall be read from positionBuffer (x,y and z)
        type: this.gl.FLOAT
      },
      // the surface normals at every vertex (used for shading)
      normals:{
        buffer: this.createNormalBuffer(),
        numOfComponents: 4,  
        type: this.gl.FLOAT
      },
      color: {
        buffer: this.createColorBuffer(),
        numOfComponents: 4,   // a color is defined by 4 values: red, green, blue and alpha
        type: this.gl.FLOAT
      },
      triangleVertexIndices: {  
        buffer: this.createVertexIndexBuffer(),
        vertexCount: this.latitudeCount*this.longitudeCount*6,       
        type: this.gl.UNSIGNED_SHORT
      },
      coordinateSystemAxes: {
        buffer: this.createCoordSystemAxesBuffer(),
        numOfComponents: 3,   // just like the vertices of the cubes, the vertices of an axis are defined by x,y and z values,
        type: this.gl.FLOAT,
        vertexCount: 6              // 3 axes, each defined by 2 vertices
      },
      normalize: false,
      stride: 0,  //  stride is 0 -> no skipping when iterating over buffer values
      offset: 0   // offer is 0 -> start from the beginning of the buffer, don't skip any values on start
    }
  }

  createPositionBuffer(){
    // Just like the other shapes, the sphere also consists of a bunch of triangles.
    // We approximate the sphere using triangles. The more triangles we use, the better our approximation
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

  createNormalBuffer(){
    const normalBuffer = this.gl.createBuffer()
    let normals = []
    for (let longitude = 0; longitude<=this.longitudeCount; longitude++){
      let phi = 2 * longitude * Math.PI / this.longitudeCount  // the azimuthal angle
      for (let latitude=0; latitude<=this.latitudeCount; latitude++){
        let theta = latitude * Math.PI / this.latitudeCount    // the polar angle (all points on the same latitude have the same polar angle)
        // the normal is nothing else but the x,y,z coordinate of the point, relative to the sphere's local coordinate system
        let x = Math.cos(phi) * Math.sin(theta)
        let y = Math.cos(theta)
        let z = Math.sin(phi) * Math.sin(theta)
        normals.push(x, y, z, 0.0)
      }
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW)
    return normalBuffer
  }

  createColorBuffer(){
    const colorBuffer = this.gl.createBuffer()
    let vertexColors = []
    let randomColor = [Math.random(), Math.random(), Math.random(), 1.0]
    for(let i=0; i<this.latitudeCount*this.longitudeCount*4; i++){
      vertexColors.push(...randomColor)
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexColors), this.gl.STATIC_DRAW)
    return colorBuffer

    
  }

  createVertexIndexBuffer(){
    // The sphere is actually rendered as a set of triangles
    // The sphere consists of horizontal and vertical "stripes" (latitude and longitude)
    // Those stripes consist of **little rectangles**, which consist of two triangles
    const indexBuffer = this.gl.createBuffer()
    let vertexIndices = []
    for (let longitude=0; longitude<this.longitudeCount; ++longitude) {
      for (let latitude=0; latitude<this.latitudeCount; ++latitude) {
        let lower = longitude + latitude*(this.longitudeCount + 1)
        let upper = lower + this.longitudeCount + 1
        vertexIndices.push(lower, upper, lower+1, upper, upper+1, lower+1)
      }
    }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), this.gl.STATIC_DRAW)
    return indexBuffer
  }

  isCollidingWithShape(shape){
    // calculate the x,y and z coordinates of two opposite corners of the cube enveloping the shape:
    let cubeCorner1 = mat4.fromValues(-1.0, -1.0, 1.0, 1.0,
                                      0.0, 0.0, 0.0, 0.0,
                                      0.0, 0.0, 0.0, 0.0,
                                      0.0, 0.0, 0.0, 0.0
                                      )
    let cubeCorner2 =  mat4.fromValues(1.0, 1.0, -1.0, 1.0,
                                      0.0, 0.0, 0.0, 0.0,
                                      0.0, 0.0, 0.0, 0.0,
                                      0.0, 0.0, 0.0, 0.0
                                      )
    mat4.multiply(cubeCorner1, shape.modelViewMatrix, cubeCorner1)
    mat4.multiply(cubeCorner2, shape.modelViewMatrix, cubeCorner2)
    let [x1,y1,z1] = cubeCorner1
    let [x2,y2,z2] = cubeCorner2
    // for our purposes (testing whether Pacman collides with a cube (wall) or an edible ball (sphere)) it is sufficient
    // to check whether Pacman's frontmost vertex and two other vertices to it's left and right are colliding with the shape
    // because collisions can only happen there, because Pacman is ALWAYS faced front towards his moving direction
    let frontMiddleVertex = mat4.fromValues(
      0.0, 0.0, 1.0, 1.0,
      0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0
    )
    let frontLeftVertex = mat4.fromValues(
      0.6, 0.0, 1.0, 1.0,
      0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0
    )
    let frontRightVertex = mat4.fromValues(
      -0.6, 0.0, 1.0, 1.0,
      0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0
    )
    mat4.multiply(frontLeftVertex, this.modelViewMatrix, frontLeftVertex)
    mat4.multiply(frontMiddleVertex, this.modelViewMatrix, frontMiddleVertex)
    mat4.multiply(frontRightVertex, this.modelViewMatrix, frontRightVertex)
    let [xLeft, yLeft, zLeft] = frontLeftVertex
    let [xMiddle, yMiddle, zMiddle] = frontMiddleVertex
    let [xRight, yRight, zRight] = frontRightVertex
    // walls are Cube objects and Pacman shouldn't jump over walls, so we don't consider y-overlaps in that case
    let isCheckingCollisionWithWall = shape.constructor.name==="Cube"
    return ( (zLeft <= z1 && zLeft >=z2  ||  zLeft >= z1 && zLeft <= z2)
            && (xLeft <= x1 && xLeft >=x2  ||  xLeft >= x1 && xLeft <= x2)
            && (isCheckingCollisionWithWall || (yLeft <= y1 && yLeft >=y2  ||  yLeft >= y1 && yLeft <= y2))
            ||
            (zMiddle <= z1 && zMiddle >=z2  ||  zMiddle >= z1 && zMiddle <= z2)
            && (xMiddle <= x1 && xMiddle >=x2  ||  xMiddle >= x1 && xMiddle <= x2)
            && (isCheckingCollisionWithWall || (yMiddle <= y1 && yMiddle >=y2  ||  yMiddle >= y1 && yMiddle <= y2))
            ||
            (zRight <= z1 && zRight >=z2  ||  zRight >= z1 && zRight <= z2)
            && (xRight <= x1 && xRight >=x2  ||  xRight >= x1 && xRight <= x2)
            && (isCheckingCollisionWithWall || (yRight <= y1 && yRight >=y2  ||  yRight >= y1 && yRight <= y2))
    )
  }

}