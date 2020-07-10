import {Application} from 'express'
export abstract class Controller {
  protected app : Application;
  constructor(_app : Application){
    this.app = _app;
  }
  abstract initiate():void;
}
