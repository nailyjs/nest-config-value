/* eslint-disable ts/ban-types */
import { ConfigService, Path } from '@nestjs/config'
import { type DynamicModule, Global, Module, type Type } from '@nestjs/common'

export const VALUE_DECORATOR_METADATA_KEY = '__value_decorator_metadata_key__'
const ValueClassSet = new Set<Type>()

interface ValueDecoratorMetadata {
  [propertyKey: string]: {
    path: string
    defaultValue?: unknown
  }
}

/**
 * Inject a `@nestjs/config`'s ConfigService value into a class property.
 *
 * @export
 * @publicApi
 * @template T The configuration object type.
 * @param {(Path<T> | (string & {}))} path The configuration path.
 * @param {unknown} [defaultValue] The default value.
 * @return {PropertyDecorator}
 */
export function Value<T extends object>(path: Path<T> | (string & {}), defaultValue?: unknown): PropertyDecorator {
  return (target, propertyKey) => {
    const oldMetadata = Reflect.getMetadata(VALUE_DECORATOR_METADATA_KEY, target) || {}
    Reflect.defineMetadata(VALUE_DECORATOR_METADATA_KEY, {
      ...oldMetadata,
      [propertyKey]: { path, defaultValue },
    } as ValueDecoratorMetadata, target.constructor)
    ValueClassSet.add(target.constructor as Type)
  }
}

@Global()
@Module({})
export class ValueDecoratorModule {
  constructor(private readonly configService: ConfigService) {
    ValueClassSet.forEach((target) => {
      const metadata = Reflect.getMetadata(VALUE_DECORATOR_METADATA_KEY, target) || {}
      for (const propertyKey in metadata) {
        const { path, defaultValue } = metadata[propertyKey]
        const value = this.configService.get(path, defaultValue)
        Object.defineProperty(target.prototype, propertyKey, {
          value,
          writable: true,
        })
      }
    })
  }

  public static register(global: boolean = true): DynamicModule {
    return {
      module: ValueDecoratorModule,
      global,
    }
  }
}
