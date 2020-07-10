export class GLUtils {
  static flatten(mat: Array<number>): Array<number>{
    let result = [];
    if (mat.length == 0) return [];
    for (let l = 0; l < 4; l++)
    for (let c = 0; c < 4; c++)
    result.push(mat[(c*4)+l]);
    return result;
  }

  static makeFrustum(left:number, right:number,bottom:number,
    top:number,znear:number, zfar:number): Array<number>{
      var X = 2*znear/(right-left);
      var Y = 2*znear/(top-bottom);
      var A = (right+left)/(right-left);
      var B = (top+bottom)/(top-bottom);
      var C = -(zfar+znear)/(zfar-znear);
      var D = -2*zfar*znear/(zfar-znear);
      return [X,0,A,0,0,Y,B,0,0,0,C,D,0, 0,-1, 0];
    }

    static makePerspective(fovy:number, aspect:number, znear:number, zfar:number){
      var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
      var ymin = -ymax;
      var xmin = ymin * aspect;
      var xmax = ymax * aspect;
      return GLUtils.makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
    }
    private static getSum(m1:Array<number>,m2:Array<number>,l:number,c:number): number{
      let sum = 0;
      for (let i = 0; i< 4; i++)
      sum = sum + (m1[(l*4) + i] * m2[(i*4) + c]);
      return sum;
    }
    static multiply(m1:Array<number>,m2:Array<number>):Array<number>{
      let result = [];
      for (let l = 0; l< 4; l++){
        for (let c = 0; c < 4; c++){
          result.push(GLUtils.getSum(m1,m2,l,c));
        }
      }
      return result;
    }
  }
