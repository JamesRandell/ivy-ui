var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * For HMR to work, we need to export an instance of the class and not the class itself
 */
class svg {
    constructor(dommanipulationinstance) {
        //i:number = 0;
        this.dommanipulationinstance = {};
        this.dommanipulationinstance = dommanipulationinstance;
        //console.log(this.i);
        //this.i++; 
        this.run();
    }
    run() {
        let svgArray = this.dommanipulationinstance.body.querySelectorAll('svg[data-url]');
        let c = svgArray.length;
        //console.log(c);
        for (let i = 0; i < c; i++) {
            let e = svgArray[i];
            //console.log(':::'+e.getAttribute('data-url'));
            let v = this.fetchSVG(e.getAttribute('data-url')).then(result => {
                //console.log(e.getAttribute('data-url'));
                let temp = document.createElement('html');
                temp.innerHTML = result;
                e.innerHTML = temp.innerHTML;
            });
        }
    }
    fetchSVG(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(filePath, {
                method: 'GET',
                headers: {
                    'Content-Type': 'image/svg+xml'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return yield response.text();
        });
    }
}
export default svg;
