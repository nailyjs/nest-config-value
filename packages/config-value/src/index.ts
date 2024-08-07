/* eslint-disable ts/ban-types */
import { Path } from '@nestjs/config'
import { type DynamicModule, Global, Module, type Type } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'
import { VALUE_DECORATOR_METADATA_KEY, ValueClassSet } from './constant'
import { ValueDecoratorMetadata } from './types'
import { ValueDecoratorExplorer } from './value.explorer'

export function Value<T extends object>(path: Path<T> | (string & {}), defaultValue?: unknown): PropertyDecorator {
  return (target, propertyKey) => {
    const oldMetadata = Reflect.getMetadata(VALUE_DECORATOR_METADATA_KEY, target.constructor as Type) || {}
    Reflect.defineMetadata(VALUE_DECORATOR_METADATA_KEY, {
      ...oldMetadata,
      [propertyKey]: { path, defaultValue },
    } as ValueDecoratorMetadata, target.constructor as Type)
    ValueClassSet.add(target.constructor as Type)
  }
}

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [ValueDecoratorExplorer],
})
export class ValueDecoratorModule {
  public static register(global: boolean = true): DynamicModule {
    return {
      module: ValueDecoratorModule,
      global,
      providers: [ValueDecoratorExplorer],
      imports: [DiscoveryModule],
    }
  }
}
