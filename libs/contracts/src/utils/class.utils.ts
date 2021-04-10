export class InstanceLoader {
  static getInstance(context: any, name: string, ...args: any[]) {
    const instance = Object.create(context[name].prototype);
    instance.constructor.apply(instance, args);
    return instance;
  }
}