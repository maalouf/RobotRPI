
import {Program} from './Program';
import {Size} from './Size';
export class Texture {
  private gl : WebGLRenderingContext;
  private size :Size;
  texture: WebGLTexture;
  private format : number;
  private textureIDs = null;

  constructor(gl:WebGLRenderingContext, size:Size, format?:number) {
    this.gl = gl;
    this.size = size;
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.format = (format !== undefined)? format : this.gl.LUMINANCE;
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.format, size.w, size.h, 0, this.format, this.gl.UNSIGNED_BYTE, null);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
  }



  fill(textureData:any, useTexSubImage2D?:boolean) {
    if (textureData.length >= this.size.w * this.size.h)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    if (useTexSubImage2D) {
      this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, this.size.w , this.size.h, this.format, this.gl.UNSIGNED_BYTE, textureData);
    } else {
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.format, this.size.w, this.size.h, 0, this.format, this.gl.UNSIGNED_BYTE, textureData);
    }
  }

  bind(n:number, program:Program, name:string) {
    if (!this.textureIDs) {
      this.textureIDs = [this.gl.TEXTURE0, this.gl.TEXTURE1, this.gl.TEXTURE2];
    }
    this.gl.activeTexture(this.textureIDs[n]);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.uniform1i(this.gl.getUniformLocation(program.program, name), n);
  }

}
