export interface ValueDecoratorMetadata {
  [propertyKey: string | symbol]: {
    path: string
    defaultValue?: unknown
  }
}
