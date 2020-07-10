import {Controller} from './Controller';
import {Application} from 'express';
import {RPIController} from './rpiControllers';
import express from "express";

export class RoutingController {
  private controllers : Array<Controller>;
  private inited : boolean = false;
  private app : Application;
  constructor(app : Application){
    this.controllers = new Array<Controller>();
    this.controllers.push(new RPIController(app));
    this.app = app;
  }
  initControllers(){
    this.inited = true;
    this.controllers.forEach(x => {
      x.initiate();
    });
    this.app.use(express.static('www'));
  }

  isInitiated(): boolean {
    return this.inited;
  }

  getControllers() : Array<Controller> {
    return this.controllers;
  }
}
