import { DataSource } from "typeorm";
import { DatabaseConnection } from "../database/connection";

export function EnsureConnection() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const connection: DataSource = this.connection;

      if (!connection.isInitialized) {
        await connection.initialize();
      }

      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
