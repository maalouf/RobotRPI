import {Script} from './Script'
export class Shader{
  shader: WebGLShader;
  constructor(gl:WebGLRenderingContext, script: Script) {
    // Now figure out what type of shader script we have, based on its MIME type.
    if (script.type == "x-shader/x-fragment") {
      this.shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (script.type == "x-shader/x-vertex") {
      this.shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      console.log("Unknown shader type: " + script.type);
      return;
    }

    // Send the source to the shader object.
    gl.shaderSource(this.shader, script.source);
    // Compile the shader program.
    gl.compileShader(this.shader);
    // See if it compiled successfully.
    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      console.log("An error occurred compiling the shaders: " + gl.getShaderInfoLog(this.shader));
      return;
    }
  }

}
