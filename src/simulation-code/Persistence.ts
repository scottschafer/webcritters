import { globals } from "./Globals";

class Persistence {
  serialize(): Object {
    const result: any = {}
    result.settings = globals.settings;
    result.pixelArray = globals.pixelArray.toString();
    globals.pixelArray.toString()
    return {};
  }
}

export const persistence = new Persistence;