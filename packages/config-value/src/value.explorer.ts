import { Injectable, OnModuleInit, type Type } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DiscoveryService } from '@nestjs/core'
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { VALUE_DECORATOR_METADATA_KEY, ValueClassSet } from './constant'
import { ValueDecoratorMetadata } from './types'

@Injectable()
export class ValueDecoratorExplorer implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  async onModuleInit() {
    const instanceWrappers: InstanceWrapper[] = [
      ...this.discoveryService.getProviders(),
      ...this.discoveryService.getControllers(),
    ]
    for (const wrapper of instanceWrappers) {
      if (!wrapper.instance || !Object.getPrototypeOf(wrapper.instance))
        continue
      const target = wrapper.instance.constructor as Type
      if (!ValueClassSet.has(target))
        continue

      const metadata = Reflect.getMetadata(VALUE_DECORATOR_METADATA_KEY, target) as ValueDecoratorMetadata || {}
      for (const propertyKey in metadata) {
        const { path, defaultValue } = (metadata[propertyKey] || {})
        const value = this.configService.get(path, defaultValue)
        Object.defineProperty(wrapper.instance, propertyKey, {
          value,
          writable: false,
        })
      }
    }
  }
}
