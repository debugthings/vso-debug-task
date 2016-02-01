/// <reference path="./icontroller.ts" />
module Controller{
class files extends IController {
    name: string;
    route: string;
  constructor()  {
      super();
      this.registerForGet("allprocesses");
    }
    allprocesses(): string {
        return "Test";
    }
}
}