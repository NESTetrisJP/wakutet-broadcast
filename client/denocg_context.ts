import { TypeDefinition } from "../common/type_definition.ts";
import * as denocg from "denocg/client";
import { createContext } from "@lit-labs/context";

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
  const promise = new Promise<denocg.Client<TypeDefinition>>((resolve) => {
    denocg.getClient<TypeDefinition>().then((client) => resolve(client));
  });
  return new DenoCGContext(promise);
};
