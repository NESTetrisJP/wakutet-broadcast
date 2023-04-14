import { TypeDefinition } from "../common/type_definition.ts";
import { denocg } from "./deps/denocg.ts";
import { createContext } from "./deps/lit.ts";

export class DenoCGContext {
  #clientPromise: Promise<denocg.Client<TypeDefinition>>;

  constructor(clientPromise: Promise<denocg.Client<TypeDefinition>>) {
    this.#clientPromise = clientPromise;
  }

  getClient(): Promise<denocg.Client<TypeDefinition>> {
    return this.#clientPromise;
  }
}

export const denocgContext = createContext<DenoCGContext>(
  Symbol("denocg"),
);

export const createDenoCGContext = (): DenoCGContext => {
  const promise = new Promise<denocg.Client<TypeDefinition>>((resolve) => { denocg.getClient<TypeDefinition>().then(client => resolve(client)); })
  return new DenoCGContext(promise);
};