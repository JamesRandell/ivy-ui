export default class BaseModule{

  ReloadRequired;
  
    constructor(){
      this.ListenForLiveReload();
    }
    
    ListenForLiveReload(){
      // Lo-fi listener just uses timeout
      setTimeout(() => {
        if (this.ReloadRequired) {
          let updatedModuleInstance = // See comments below
          Reload(updatedModuleInstance);
        }
        ListenForLiveReload();
      }, 500);
    }
    
    Reload(updatedModuleInstance){
      let mapper = new ClassMapper(this, updatedModuleInstance);
      mapper.Merge();
    }
  }