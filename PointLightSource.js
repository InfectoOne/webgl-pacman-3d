class PointLightSource{
  constructor(position=[0.0, 15.0, -15.0, 1.0]){
    this.position = position
    this.positionMatrix = mat4.create()
    this.ambientColor = [0.5, 0.5, 0.5, 1.0]   
    this.diffuseColor = [1.0, 1.0, 1.0, 1.0]    //white
    this.specularColor = [1.0, 1.0, 1.0, 1.0]
    this.isDiffuseEnabled  = true
    this.isSpecularEnabled = true
  }

  rotateX(angleInRadians){
    let rotationMatrix = mat4.create()
    mat4.fromRotation(rotationMatrix, angleInRadians, [1, 0, 0])
    mat4.multiply(this.positionMatrix, rotationMatrix, this.positionMatrix)
  }

  rotateY(angleInRadians){
    let rotationMatrix = mat4.create()
    mat4.fromRotation(rotationMatrix, angleInRadians, [0, 1, 0])
    mat4.multiply(this.positionMatrix, rotationMatrix, this.positionMatrix)
  }

  rotateZ(angleInRadians){
    let rotationMatrix = mat4.create()
    mat4.fromRotation(rotationMatrix, angleInRadians, [0, 0, 1])
    mat4.multiply(this.positionMatrix, rotationMatrix, this.positionMatrix)
  }

  scaleX(factor){
    mat4.scale(this.positionMatrix,  // variable where the result gets stored
              this.positionMatrix,   // matrix to scale
              [factor, 1, 1]          // scaling factors (for x,y and z)
    )
  }

  scaleY(factor){
    mat4.scale(this.positionMatrix,   // variable where the result gets stored
              this.positionMatrix,    // matrix to scale
              [1, factor, 1]           // scaling factors (for x,y and z)
    )
  }

  scaleZ(factor){
    mat4.scale(this.positionMatrix,  // variable where the result gets stored
      this.positionMatrix,           // matrix to rotate
      [1, 1, factor]                  // scaling factors (for x,y and z)
    )
  }

  translateX(amount){
    let translationMatrix = mat4.create()
    mat4.fromTranslation(translationMatrix, [amount, 0, 0])
    mat4.multiply(this.positionMatrix, translationMatrix, this.positionMatrix)
  }

  translateY(amount){
    let translationMatrix = mat4.create()
    mat4.fromTranslation(translationMatrix, [0, amount, 0])
    mat4.multiply(this.positionMatrix, translationMatrix, this.positionMatrix)           
  }

  translateZ(amount){
    let translationMatrix = mat4.create()
    mat4.fromTranslation(translationMatrix, [0, 0, amount])
    mat4.multiply(this.positionMatrix, translationMatrix, this.positionMatrix)
  }
}