

class IController {
    name: string;
    route: string;
    getfunctions: string[];
    putfunctions: string[];
    postfunctions: string[];
    deletefunctions: string;
    constructor() {
    }
    registerForGet(fn) {
        this.getfunctions.concat(fn);
    }
    registerForPut(fn) {
        this.getfunctions.concat(fn);
    }
    registerForPost(fn) {
        this.getfunctions.concat(fn);
    }
    registerForDeletet(fn) {
        this.getfunctions.concat(fn);
    }
}