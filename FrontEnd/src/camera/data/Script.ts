
/**
* Represents a WebGL shader script.
*/

export class Script {
  type : string;
  source : string;
  constructor(){}
  static createFromSource(type:string, source:string) {
    var res = new Script();
    res.type = type;
    res.source = source;
    return res;
  }

}
