/// <reference path="./icontroller.ts" />
export module Controller{
    class debuggers extends IController {
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

