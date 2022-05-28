// creates a shader of the passed type (vertex or fragment shader) and compiles passed shader source code
function loadShader(gl, GLShaderType, shaderSourceCode) {
  const shader = gl.createShader(GLShaderType)
  // Send the GLSL source code to the shader object
  gl.shaderSource(shader, shaderSourceCode)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(`Error on compiling shader: ${gl.getShaderInfoLog(shader)}`)
    gl.deleteShader(shader)
    return null
  }
  return shader
}

// initializes the shader program using the passed vertex/fragment shader source code
function initShaderProgram(gl, vShaderSourceCode, fShaderSourceCode) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vShaderSourceCode)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fShaderSourceCode)

  // a shader program is a set of vertex and fragment shaders
  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(`Failed to initialize the shader program:  ${gl.getProgramInfoLog(shaderProgram)}`)
    return null
  }

  return shaderProgram;
}

