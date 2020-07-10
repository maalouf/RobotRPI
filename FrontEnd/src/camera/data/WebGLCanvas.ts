
/**
* WebGL backed canvas that sets up: a quad to paint a texture on, appropriate vertex/fragment shaders,
* scene parameters and other things. Specialized versions of this class can be created by overriding several
* initialization methods.

*/

import {Script} from './Script';
import {GLUtils} from './glUtils';
import {Size} from './Size';
import {Program} from './Program';
import {Shader} from './Shader';
import {Texture} from './Texture';

export class WebGLCanvas {
  vertexShaderScript = Script.createFromSource("x-shader/x-vertex", `
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;
  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  varying highp vec2 vTextureCoord;
  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
  }
  `);


  fragmentShaderScript = Script.createFromSource("x-shader/x-fragment", `
  precision highp float;
  varying highp vec2 vTextureCoord;
  uniform sampler2D YTexture;
  uniform sampler2D UTexture;
  uniform sampler2D VTexture;
  const mat4 YUV2RGB = mat4
  (
    1.1643828125, 0, 1.59602734375, -.87078515625,
    1.1643828125, -.39176171875, -.81296875, .52959375,
    1.1643828125, 2.017234375, 0, -1.081390625,
    0, 0, 0, 1
  );

  void main(void) {
    gl_FragColor = vec4( texture2D(YTexture,  vTextureCoord).x, texture2D(UTexture, vTextureCoord).x, texture2D(VTexture, vTextureCoord).x, 1) * YUV2RGB;
  }
  `);


  canvas: any;
  size : Size;
  gl : WebGLRenderingContext;
  program : Program;

  vertexPositionAttribute : number;
  textureCoordAttribute : number;
  quadVPBuffer : WebGLBuffer;
  quadVTCBuffer : WebGLBuffer;
  framebuffer : WebGLFramebuffer;
  framebufferTexture : Texture;

  YTexture : Texture;
  UTexture : Texture;
  VTexture : Texture;


  perspectiveMatrix: Array<number>
  mvMatrix : Array<number>;

  constructor(canvas:any,width:number,height:number) {

    this.canvas = canvas;
    this.size = new Size(width,height);
    this.canvas.width = this.size.w;
    this.canvas.height = this.size.h;
    this.gl = this.canvas.getContext("webgl");

    this.onInitShaders();
    this.initBuffers();

    this.YTexture = new Texture(this.gl, this.size);
    this.UTexture = new Texture(this.gl, this.size.getHalfSize());
    this.VTexture = new Texture(this.gl, this.size.getHalfSize());


    this.initScene();
  }

  onInitShaders() {
    this.program = new Program(this.gl);
    this.program.attach(new Shader(this.gl, this.vertexShaderScript));
    this.program.attach(new Shader(this.gl, this.fragmentShaderScript));
    this.program.link();
    this.program.use();
    this.vertexPositionAttribute = this.program.getAttributeLocation("aVertexPosition");
    this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
    this.textureCoordAttribute = this.program.getAttributeLocation("aTextureCoord");;
    this.gl.enableVertexAttribArray(this.textureCoordAttribute);
  }

  initBuffers() {
    // Create vertex position buffer.
    this.quadVPBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVPBuffer);
    let tmp = [
      1.0,  1.0, 0.0,
      -1.0,  1.0, 0.0,
      1.0, -1.0, 0.0,
      -1.0, -1.0, 0.0];

      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(tmp), this.gl.STATIC_DRAW);
      this.quadVPBuffer['itemSize'] = 3;
      this.quadVPBuffer['numItems'] = 4;
      var scaleX = 1.0;
      var scaleY = 1.0;
      // Create vertex texture coordinate buffer.
      this.quadVTCBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVTCBuffer);
      tmp = [
        scaleX, 0.0,
        0.0, 0.0,
        scaleX, scaleY,
        0.0, scaleY,
      ];
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(tmp), this.gl.STATIC_DRAW);
    }

    mvIdentity() {
      this.mvMatrix = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
    }

    mvMultiply(m:Array<number>) {
      this.mvMatrix =  GLUtils.multiply(this.mvMatrix,m);
    }

    mvTranslate(m:Array<number>) {
      this.mvMultiply([1,0,0,m[0],0,1,0,m[1],0,0,1,m[2],0,0,0,1]);
    }

    setMatrixUniforms() {
      this.program.setMatrixUniform("uPMatrix", new Float32Array(GLUtils.flatten(this.perspectiveMatrix)));
      this.program.setMatrixUniform("uMVMatrix", new Float32Array(GLUtils.flatten(this.mvMatrix)));
    }

    initScene() {
      this.perspectiveMatrix = GLUtils.makePerspective(45, 1, 0.1, 100.0);
      this.mvIdentity();
      this.mvTranslate([0.0, 0.0, -2.4]);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVPBuffer);
      this.gl.vertexAttribPointer(this.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVTCBuffer);
      this.gl.vertexAttribPointer(this.textureCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);

      this.YTexture.bind(0, this.program, "YTexture");
      this.UTexture.bind(1, this.program, "UTexture");
      this.VTexture.bind(2, this.program, "VTexture");

      this.setMatrixUniforms();
      if (this.framebuffer) {
        console.log("Bound Frame Buffer");
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
      }
    }

    toString():string {
      return "WebGLCanvas Size: " + this.size;
    }

    decode(buffer:any, width:number, height:number) {
      if (!buffer)return;
      let lumaSize = width * height;
      let chromaSize = lumaSize >> 2;
      let outPutBuffer = new Uint8ClampedArray(width*height*4);

      this.YTexture.fill(buffer.subarray(0, lumaSize));
      this.UTexture.fill(buffer.subarray(lumaSize, lumaSize + chromaSize));
      this.VTexture.fill(buffer.subarray(lumaSize + chromaSize, lumaSize + 2 * chromaSize));
      this.drawScene();
      this.gl.readPixels(0, 0, this.size.w, this.size.h, this.gl.RGBA, this.gl.UNSIGNED_BYTE, outPutBuffer);
      return {"buffer":outPutBuffer,"width":width,"height":height};
    }

    drawScene() {
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

  }
