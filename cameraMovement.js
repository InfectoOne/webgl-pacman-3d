var isCameraMode = false
var projectionMatrix = null

function initCamera(){
  const fieldOfViewInRadians = 60 * Math.PI / 180 
  const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight
  const zNear = 0.1   // nothing closer than z=0.1 is visible
  const zFar = 100.0  // nothing further than z=100.0 is visible
  projectionMatrix = mat4.create()
  
  let shearMatrix = mat4.fromValues( 1.0, 0.0, 0.0, 0.0,
                  0.2, 1.0, 0.0, 0.0,
                  0.0, 0.0, 1.0, 0.0,
                  0.0, 0.0, 0.0, 1.0
  )
  
  mat4.perspective(projectionMatrix,
                  fieldOfViewInRadians,
                  aspectRatio,
                  zNear,
                  zFar
  )
  
  //mat4.ortho(projectionMatrix, -5.0, 5.0, -5.0, 5.0, zNear, zFar)
  mat4.multiply(projectionMatrix, shearMatrix, projectionMatrix)
}

function translateCameraX(amount){
  mat4.translate(projectionMatrix,  
                projectionMatrix,             
                [amount, 0, 0]                      
  )
}

function translateCameraY(amount){
  mat4.translate(projectionMatrix,  
                projectionMatrix,              
                [0, amount, 0]    
  )
}

function translateCameraZ(amount){
  mat4.translate(projectionMatrix,
                projectionMatrix,          
                [0, 0, amount]              
  )
}

function rotateCameraX(angleInRadians){
  mat4.rotate(projectionMatrix, 
              projectionMatrix, 
              angleInRadians,        
              [1, 0, 0]           
  )
}

function rotateCameraY(angleInRadians){
  mat4.rotate(projectionMatrix,  
              projectionMatrix,  
              angleInRadians,       
              [0, 1, 0]          
  )
}

function rotateCameraZ(angleInRadians){
  mat4.rotate(projectionMatrix,  
              projectionMatrix,  
              angleInRadians,   
              [0, 0, 1]            
  )
}