// WebGL runs on the GPU, so we need to provide the code that will run on the GPU.
// That code consists of two functions written in a C/C++ like language called GLSL
// Those two functions are a vertex and a fragment shader.
// There are no default shaders in WebGL so we create our own ones:

// a vertex shader computes positions of vertices. Vertex positions are used to draw primitives like lines, points or triangles
// The coordinates are called "clip-space coordinates" and they always range from -1 to 1, regardless of what our canvas size is

// Phong shading is not per-vertex, but per-pixel shading and therefore better-looking but computationally expensive 
const PHONG_SHADER = {
  vertexShaderCode: `
    // we pass data to the GPU using "buffers" (we can pass whatever we want, essentially)
    // while "attributes" specify how the GPU should pull data out of the buffer
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexNormal;

    // uniforms are like global variables for the shader
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    uniform vec4 uLightSourcePosition;
    uniform mat4 uLightPositionMatrix;


    // these varying variables will be passed further to the fragment shader:
    varying vec3 nViewerDirection;
    varying vec3 nDistFromSource;
    varying vec3 nNormal;

    // this function gets called once for every vertex being rendered:
    void main() {
      // set the position of the vertex by setting the value of the pre-defined gl_Position variable:
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vec4 lightPosition = uLightPositionMatrix * uLightSourcePosition;
      nViewerDirection = -normalize((uModelViewMatrix * aVertexPosition).xyz);
      nDistFromSource = normalize(lightPosition.xyz - (uModelViewMatrix * aVertexPosition).xyz);
      nNormal = normalize((uModelViewMatrix * aVertexNormal).xyz);
    }
  `,

// a fragment shader is then responsible for coloring every pixel of a primitive we want to draw
  fragmentShaderCode : `
    precision mediump float;

    uniform vec4 uLightAmbientColor;
    uniform vec4 uMaterialAmbientColor; 

    uniform vec4 uLightDiffuseColor;
    uniform vec4 uLightSpecularColor;   

    uniform vec4 uMaterialDiffuseColor;
    uniform vec4 uMaterialSpecularColor;

    uniform float uShininess;

    uniform bool uIsDiffuseEnabled;
    uniform bool uIsSpecularEnabled;

    varying vec3 nViewerDirection;
    varying vec3 nDistFromSource;
    varying vec3 nNormal;

    //  this functions gets called every time a pixel needs to be filled with color
    void main() {
      // ==================    compute the diffuse shading according to the Phong model:   ==================
      vec4 ambient = uLightAmbientColor * uMaterialAmbientColor;

      // ==================    compute the diffuse shading according to the Phong model:   ==================
      vec4 diffuse;
      if(uIsDiffuseEnabled){
        diffuse = max(dot(nDistFromSource, nNormal), 0.0) * uLightDiffuseColor * uMaterialDiffuseColor;
      } else {
        diffuse = vec4(0.0, 0.0, 0.0, 0.0);
      }

      // ================== compute the specular shading according to the the Phong model: ==================
      vec4 specular;
      if(uIsSpecularEnabled){
        vec3 nTotalDist = normalize(nDistFromSource + nViewerDirection);
        specular = pow(max(dot(nNormal, nTotalDist), 0.0), uShininess) * uLightSpecularColor * uMaterialSpecularColor;
        if(dot(nDistFromSource, nNormal) < 0.0){  // if light source below horizon
          specular = vec4(0.0, 0.0, 0.0, 1.0);
        }
      } else {
        specular = vec4(0.0, 0.0, 0.0, 0.0);
      }
      gl_FragColor = ambient + diffuse + specular;
      gl_FragColor.a = 1.0;

    }
  `
}