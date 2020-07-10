export class Program {
  private gl : WebGLRenderingContext;
  program : WebGLProgram;
  constructor(gl : WebGLRenderingContext){
    this.gl = gl;
    this.program = this.gl.createProgram();
  }
  // attach(shader: WebGLShader) {
  //     this.gl.attachShader(this.program, shader.shader);
  //   },
  attach(shader: any) {
    this.gl.attachShader(this.program, shader.shader);
  }
  link() {
    this.gl.linkProgram(this.program);
  }
  use() {
    this.gl.useProgram(this.program);
  }
  getAttributeLocation(name: string) {
    return this.gl.getAttribLocation(this.program, name);
  }
  setMatrixUniform(name: string, array:Float32Array) {
    let uniform = this.gl.getUniformLocation(this.program, name);
    this.gl.uniformMatrix4fv(uniform, false, array);
  }
}
