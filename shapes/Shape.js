class Shape{
  constructor(gl, projectionMatrix, lightSource){
    this.gl = gl
    this.projectionMatrix = projectionMatrix
    this.modelViewMatrix = mat4.create()
    this.materialAmbientColor = [52/255, 131/255, 235/255, 1.0]  // kinda cyanish (b)
    this.materialDiffuseColor = [52/255, 131/255, 235/255, 1.0]  // kinda blue
    this.materialSpecularColor = [1.0, 1.0, 1.0, 1.0]
    this.shininess = 50.0

    // if initializing a Shape for the first time:
    if(!Shape.shaderProgram){
      Shape.initShaderProgram(gl)
      Shape.lightSource = lightSource
    }
  }

  static initShaderProgram(gl, shaderObject = PHONG_SHADER){
    // shaderObject should be either Gourard or Phong shader. The default is Phong
    Shape.currentShader = shaderObject
    Shape.shaderProgram = initShaderProgram(gl, shaderObject.vertexShaderCode, shaderObject.fragmentShaderCode)
    if (!Shape.shaderProgram) {
      throw new Error('Error on initializing the GLSL shader program')
    }
    Shape.locations = {
      attribute: {
        vertexPosition: gl.getAttribLocation(Shape.shaderProgram, 'aVertexPosition'), // aVertexPosition in shader_initializer.js
        vertexNormal: gl.getAttribLocation(Shape.shaderProgram, 'aVertexNormal')
      },
      uniform: {
        projectionMatrix: gl.getUniformLocation(Shape.shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(Shape.shaderProgram, 'uModelViewMatrix'),
        lightSourcePosition: gl.getUniformLocation(Shape.shaderProgram, 'uLightSourcePosition'),
        lightPositionMatrix: gl.getUniformLocation(Shape.shaderProgram, 'uLightPositionMatrix'),
        lightAmbientColor: gl.getUniformLocation(Shape.shaderProgram, 'uLightAmbientColor'),
        materialAmbientColor: gl.getUniformLocation(Shape.shaderProgram, 'uMaterialAmbientColor'),
        lightDiffuseColor: gl.getUniformLocation(Shape.shaderProgram, 'uLightDiffuseColor'),
        materialDiffuseColor: gl.getUniformLocation(Shape.shaderProgram, 'uMaterialDiffuseColor'),
        lightSpecularColor: gl.getUniformLocation(Shape.shaderProgram, 'uLightSpecularColor'),
        materialSpecularColor: gl.getUniformLocation(Shape.shaderProgram, 'uMaterialSpecularColor'),
        shininess: gl.getUniformLocation(Shape.shaderProgram, 'uShininess'),
        isDiffuseEnabled: gl.getUniformLocation(Shape.shaderProgram, 'uIsDiffuseEnabled'),
        isSpecularEnabled: gl.getUniformLocation(Shape.shaderProgram, 'uIsSpecularEnabled')
      }
    }
    // attributes (see shader_initializer.js) are disabled per default. We simply enable them here:
    gl.enableVertexAttribArray(Shape.locations.attribute.vertexPosition)
    gl.enableVertexAttribArray(Shape.locations.attribute.vertexNormal)
  }
  

  createCoordSystemAxesBuffer(){
    // We draw a local coordinate system of a shape simply as 3 lines (x,y and z axis) 
    let axesBuffer = this.gl.createBuffer()
    const axisVertices = [
        0.0, 0.0, 0.0,    // x-axis: defined by the vertex (0,0,0) and (5,0,0)
        5.0, 0.0, 0.0,

        0.0, 0.0, 0.0,    // y-axis: defined by the vertex (0,0,0) and (0,5,0)
        0.0, 5.0, 0.0,

        0.0, 0.0, 0.0,    // z-axis defined by the vertex (0,0,0) and (0,0,5)
        0.0, 0.0, 5.0
    ]
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, axesBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(axisVertices), this.gl.STATIC_DRAW)
    return axesBuffer
  }

  /* ============================================================================== */
  /* ===================== METHODS FOR TRANSFORMING A SHAPE  ====================== */
  /* ============================================================================== */

  rotateX(angleInRadians, isGlobal=false){
    if(isGlobal){
      let rotationMatrix = mat4.create()
      mat4.fromRotation(rotationMatrix, angleInRadians, [1, 0, 0])
      mat4.multiply(this.modelViewMatrix, rotationMatrix, this.modelViewMatrix)
    } else {
      mat4.rotate(this.modelViewMatrix,  // variable where the result gets stored
                  this.modelViewMatrix,  // matrix to rotate
                  angleInRadians,        // amount to rotate in radians
                  [1, 0, 0]              // axis to rotate around
      )
    }
  }

  rotateY(angleInRadians, isGlobal=false){
    if(isGlobal){
      let rotationMatrix = mat4.create()
      mat4.fromRotation(rotationMatrix, angleInRadians, [0, 1, 0])
      mat4.multiply(this.modelViewMatrix, rotationMatrix, this.modelViewMatrix)
    } else {
      mat4.rotate(this.modelViewMatrix,  // variable where the result gets stored
                  this.modelViewMatrix,  // matrix to rotate
                  angleInRadians,        // amount to rotate in radians
                  [0, 1, 0]              // axis to rotate around
      )
    }
  }

  rotateZ(angleInRadians, isGlobal=false){
    if(isGlobal){
      let rotationMatrix = mat4.create()
      mat4.fromRotation(rotationMatrix, angleInRadians, [0, 0, 1])
      mat4.multiply(this.modelViewMatrix, rotationMatrix, this.modelViewMatrix)
    } else {
      mat4.rotate(this.modelViewMatrix,  // variable where the result gets stored
                  this.modelViewMatrix,  // matrix to rotate
                  angleInRadians,        // amount to rotate in radians
                  [0, 0, 1]              // axis to rotate around
      )
    }
  }

  scale(factor){
    this.scaleX(factor)
    this.scaleY(factor)
    this.scaleZ(factor)

  }

  scaleX(factor){
    mat4.scale(this.modelViewMatrix,  // variable where the result gets stored
              this.modelViewMatrix,   // matrix to scale
              [factor, 1, 1]          // scaling factors (for x,y and z)
    )
  }

  scaleY(factor){
    mat4.scale(this.modelViewMatrix,   // variable where the result gets stored
              this.modelViewMatrix,    // matrix to scale
              [1, factor, 1]           // scaling factors (for x,y and z)
    )
  }

  scaleZ(factor){
    mat4.scale(this.modelViewMatrix,  // variable where the result gets stored
      this.modelViewMatrix,           // matrix to rotate
      [1, 1, factor]                  // scaling factors (for x,y and z)
    )
  }

  translateX(amount, isGlobal=false){
    if(isGlobal){
      let translationMatrix = mat4.create()
      mat4.fromTranslation(translationMatrix, [amount, 0, 0])
      mat4.multiply(this.modelViewMatrix, translationMatrix, this.modelViewMatrix)
    } else {
      mat4.translate(this.modelViewMatrix,  // variable where the result gets stored
        this.modelViewMatrix,               // matrix to translate
        [amount, 0, 0]                      // translation amount (for x,y and z)
      )
    }
  }

  translateY(amount, isGlobal=false){
    if(isGlobal){
      let translationMatrix = mat4.create()
      mat4.fromTranslation(translationMatrix, [0, amount, 0])
      mat4.multiply(this.modelViewMatrix, translationMatrix, this.modelViewMatrix)
    } else {
      mat4.translate(this.modelViewMatrix,  // variable where the result gets stored
        this.modelViewMatrix,               // matrix to translate
        [0, amount, 0]     // translation amount (for x,y and z)
      )
    }              
  }

  translateZ(amount, isGlobal=false){
    if(isGlobal){
      let translationMatrix = mat4.create()
      mat4.fromTranslation(translationMatrix, [0, 0, amount])
      mat4.multiply(this.modelViewMatrix, translationMatrix, this.modelViewMatrix)
    } else {
      mat4.translate(this.modelViewMatrix,  // variable where the result gets stored
        this.modelViewMatrix,               // matrix to translate
        [0, 0, amount]                      // translation amount (for x,y and z)
      )
    }
  }

  

  /* ============================================================================== */
  /* =================== METHODS FOR ACTUALLY DRAWING A SHAPE ==================== */
  /* ============================================================================== */

  draw(){
    this.gl.useProgram(Shape.shaderProgram)
    // set our vertex shader's uniforms (see shader_initializer.js):
    this.gl.uniformMatrix4fv(Shape.locations.uniform.projectionMatrix, false, this.projectionMatrix)
    this.gl.uniformMatrix4fv(Shape.locations.uniform.modelViewMatrix, false, this.modelViewMatrix)

    this.gl.uniform4fv(Shape.locations.uniform.lightSourcePosition, Shape.lightSource.position)
    this.gl.uniformMatrix4fv(Shape.locations.uniform.lightPositionMatrix, false, Shape.lightSource.positionMatrix)

    this.gl.uniform4fv(Shape.locations.uniform.lightAmbientColor, Shape.lightSource.ambientColor)
    this.gl.uniform4fv(Shape.locations.uniform.materialAmbientColor, this.materialAmbientColor)

    this.gl.uniform4fv(Shape.locations.uniform.lightDiffuseColor, Shape.lightSource.diffuseColor)
    this.gl.uniform4fv(Shape.locations.uniform.materialDiffuseColor, this.materialDiffuseColor)

    this.gl.uniform4fv(Shape.locations.uniform.lightSpecularColor, Shape.lightSource.specularColor)
    this.gl.uniform4fv(Shape.locations.uniform.materialSpecularColor, this.materialSpecularColor)
    this.gl.uniform1f(Shape.locations.uniform.shininess, this.shininess)

    this.gl.uniform1i(Shape.locations.uniform.isDiffuseEnabled, Shape.lightSource.isDiffuseEnabled)
    this.gl.uniform1i(Shape.locations.uniform.isSpecularEnabled, Shape.lightSource.isSpecularEnabled)

    /* ======================== POSITIONS OF THE VERTICES ========================*/
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position.buffer) // set positionBuffer as current buffer
     // bind the vertexPosition attribute to the current buffer (positionBuffer in our case):
    this.gl.vertexAttribPointer(Shape.locations.attribute.vertexPosition,
                                this.buffers.position.numOfComponents,
                                this.buffers.position.type,
                                this.buffers.normalize,
                                this.buffers.stride,
                                this.buffers.offset
    )

    /* ======================== NORMALS OF THE VERTICES (FOR SHADING) ========================*/
    if(!!this.buffers.normals){
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normals.buffer) 
      this.gl.vertexAttribPointer(Shape.locations.attribute.vertexNormal,
                                  this.buffers.normals.numOfComponents,
                                  this.buffers.normals.type,
                                  this.buffers.normalize,
                                  this.buffers.stride,
                                  this.buffers.offset
      )
    }

    /* ================= VERTEX INDICES FOR TRIANGLES OUR Shape FACES CONSIST OF ==================*/
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.triangleVertexIndices.buffer)
    // gl.TRIANGLES means: for every 3 vertices we read, WebGL will draw a triangle out of them
    this.gl.drawElements(this.gl.TRIANGLES,
                        this.buffers.triangleVertexIndices.vertexCount,
                        this.buffers.triangleVertexIndices.type,
                        this.buffers.offset
    )
  }

  drawCoordinateSystem(){
    this.gl.disable(this.gl.DEPTH_TEST)   // makes sure the coordinate system overlays the shape
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.coordinateSystemAxes.buffer)
    this.gl.vertexAttribPointer(Shape.locations.attribute.vertexPosition,
                                this.buffers.coordinateSystemAxes.numOfComponents,
                                this.buffers.coordinateSystemAxes.type,
                                this.buffers.normalize,
                                this.buffers.stride,
                                this.buffers.offset
    )

    gl.drawArrays(gl.LINES, this.buffers.offset, this.buffers.coordinateSystemAxes.vertexCount)
    this.gl.enable(this.gl.DEPTH_TEST)   // makes sure the coordinate system overlays the shape
  }
}