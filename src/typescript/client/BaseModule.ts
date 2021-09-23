//@ts-ignore
import { ClassMapper } from "/resource/script/client/ClassMapper.js";

export default class BaseModule {
  
  constructor(){
      //this.Reload(new.target.name);
      //console.log('ggfg');
      //console.warn(new.target.name);

  }
    
  Reload(module){ 
    let mapper = new ClassMapper(this, module);
    mapper.Merge();
  }
}