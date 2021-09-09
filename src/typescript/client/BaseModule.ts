/*
import { ClassMapper } from "/resource/script/ClassMapper.js";

export default class BaseModule{

  ReloadRequired;
  module;

    constructor(module){console.log(44444);
      this.ListenForLiveReload();
    }
    
    ListenForLiveReload(){
      // Lo-fi listener just uses timeout
      setTimeout(() => {
        if (this.ReloadRequired) {
          //let updatedModuleInstance = // See comments below
          this.Reload(this.module);
        }
        this.ListenForLiveReload();
      }, 500);
    }
    
    Reload(module){
      let mapper = new ClassMapper(this, module);
      mapper.Merge();
    }
  }
  */