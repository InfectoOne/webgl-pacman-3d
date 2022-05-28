class Cube extends Shape{

  /* ============================================================================== */
  /* ========================== BASIC SCAFFOLDING METHODS ========================== */
  /* ============================================================================== */
  constructor(gl, projectionMatrix, lightSource, color){
    super(gl, projectionMatrix, lightSource)
    this.color = color
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
      triangleVertexIndices: {  // we render the cube by rendering each face of the cube as consisting of 2 triangles
        buffer: this.createVertexIndexBuffer(),
        vertexCount: 36,            // 6 faces of the cube * (2 triangles per face * 3 vertices per triangle),
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
    // create a buffer for this cube's vertex positions (even though a cube actually has 8 vertices,
    // we define separate vertices for every face of the cube, so 4 vertices * 6 faces = 24 )
    const positionBuffer = this.gl.createBuffer()
    const vertices = [
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      
      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,
      
      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,
      
      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,
      
      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,
      
      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0,
    ]
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW)
    return positionBuffer
  }

  createNormalBuffer(){
    const normalBuffer = this.gl.createBuffer()
    let normals = [
      // Front face
      0.0,  0.0,  1.0, 0.0,
      0.0,  0.0,  1.0, 0.0,
      0.0,  0.0,  1.0, 0.0,
      0.0,  0.0,  1.0, 0.0,
      // Back face 0.0,
      0.0,  0.0, -1.0, 0.0,
      0.0,  0.0, -1.0, 0.0,
      0.0,  0.0, -1.0, 0.0,
      0.0,  0.0, -1.0, 0.0,
       // Top face 0.0,
      0.0,  1.0,  0.0, 0.0,
      0.0,  1.0,  0.0, 0.0,
      0.0,  1.0,  0.0, 0.0,
      0.0,  1.0,  0.0, 0.0,
       // Bottom face 0.0,
      0.0, -1.0,  0.0, 0.0,
      0.0, -1.0,  0.0, 0.0,
      0.0, -1.0,  0.0, 0.0,
      0.0, -1.0,  0.0, 0.0,
      // Right face 0.0,
      1.0,  0.0,  0.0, 0.0,
      1.0,  0.0,  0.0, 0.0,
      1.0,  0.0,  0.0, 0.0,
      1.0,  0.0,  0.0, 0.0,
      
      // Left face
      -1.0,  0.0,  0.0, 0.0,
      -1.0,  0.0,  0.0, 0.0,
      -1.0,  0.0,  0.0, 0.0,
      -1.0,  0.0,  0.0, 0.0,
    ]
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW)
    return normalBuffer
  }

  createColorBuffer(){
    // create a buffer for a triangle's vertex colors
    const colorBuffer = this.gl.createBuffer()
    const faceColors = !!this.color ? [ [this.color], [this.color], [this.color], [this.color], [this.color], [this.color]]
                        : [
                          [Math.random(),  Math.random(),  Math.random(),  1.0],    // front face color
                          [Math.random(),  Math.random(),  Math.random(),  1.0],    // back face color
                          [Math.random(),  Math.random(),  Math.random(),  1.0],    // top face color
                          [Math.random(),  Math.random(),  Math.random(),  1.0],    // bottom face color
                          [Math.random(),  Math.random(),  Math.random(),  1.0],    // right face color
                          [Math.random(),  Math.random(),  Math.random(),  1.0],    // left face color
                        ] 


    // however, in WebGL we define colors per vertex, not per "face of the cube"
    // Every face has 4 vertices.
    // For the whole face to have the same color on its whole surface, all of its 4 vertices need to have the same color
    // that's why we need to have a total of 4 copies of every face color (for every of its vertices):
    let vertexColors = []
    faceColors.forEach(faceColor => vertexColors.push(...faceColor, ...faceColor, ...faceColor, ...faceColor))
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexColors), this.gl.STATIC_DRAW)
    return colorBuffer
  }

  createVertexIndexBuffer(){
    const indexBuffer = this.gl.createBuffer()
    // The cube is actually rendered as a set of triangles, where every face of the cube consists of two triangles
    // We already defined the vertices in the position buffer. 
    // Here, we define a triangle as a set of 3 indices of the vertices of the position buffer:
    // e.g. (0, 1, 2) stands for a triangle defined by the 0th, 1st and 2nd vertex from the position buffer
    const vertexIndices = [
      0,  1,  2,      0,  2,  3,    // the vertices of the two triangles on the front face
      4,  5,  6,      4,  6,  7,    // back face
      8,  9,  10,     8,  10, 11,   // top face
      12, 13, 14,     12, 14, 15,   // bottom face
      16, 17, 18,     16, 18, 19,   // right face
      20, 21, 22,     20, 22, 23,   // left face
    ]
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), this.gl.STATIC_DRAW)
    return indexBuffer
  }

}