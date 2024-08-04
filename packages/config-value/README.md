# @Value Decorator Module for @nestjs/config ⚙️

This module provides a `@Value` decorator to inject configuration values into your NestJS application.

## Installation

```bash
pnpm i @nailyjs.nest.modules/config-value
```

## Usage

At first, you need to register the `ValueDecoratorModule` in your application module.

```typescript
import { Module } from '@nestjs/common';
import { ValueDecoratorModule } from '@nailyjs.nest.modules/config-value';

@Module({
  imports: [ValueDecoratorModule],
})
export class AppModule {}
```

Then you can use the `@Value` decorator anywhere in your application.

```typescript
import { Injectable } from '@nestjs/common';
import { Value } from '@nailyjs.nest.modules/config-value';

@Injectable()
export class AppService {
  constructor(@Value('PORT') private readonly port: number) {}

  getPort(): number {
    return this.port;
  }
}
```

## Typings

The `@Value`'s typings is here:

```typescript
import type { Path } from "@nestjs/config";

function Value<T extends object>(path: Path<T>, defaultValue?: unknown): PropertyDecorator
```

The `Path` type util can be infer your configuration object to provide autocompletion:

![The autocompletion](https://github.com/nailyjs/nest-config-value/blob/v1/screenshots/typings.png?raw=true)

Best usage is create your own `@Value` decorator:

```typescript
import { Value as ConfigValue } from '@nailyjs.nest.modules/config-value';

type ConfigurationObject = { foo: string }
export const Value = ConfigValue<ConfigurationObject> // (path: "foo", defaultValue?: unknown) => PropertyDecorator
```

And use it across your application.

## With zod validation

You can use `zod` to validate your configuration values, and it can use `z.infer` to infer the type of your configuration object, but sometimes this project maybe cannot correctly infer the type of your configuration object（especially when you use `zod`'s `passthrough()` method）, the solution is construct two types: `DeepRequired` and `DeepRemoveIndexSignature` to remove the `?` and `index signature` of your configuration object.

Here are the types:

```typescript
export type DeepRequired<T> = T extends object
  ? { [K in keyof T]-?: DeepRequired<T[K]> }
  : T
export type RemoveIndexSignature<T> = {
  [K in keyof T as K extends `${infer _}` ? K : never]: T[K];
}

export type DeepRemoveIndexSignature<T> = T extends object
  ? { [K in keyof RemoveIndexSignature<T>]: DeepRemoveIndexSignature<RemoveIndexSignature<T>[K]> }
  : T
```

And here is the usage:

```typescript
import { Value as ConfigValue } from '@nailyjs.nest.modules/config-value';
import { z } from 'zod';

const ConfigSchema = z.object({
  foo: z.string(),
  bar: z.number().optional(),
  baz: z.object({
    qux: z.string(),
  }).passthrough(),
})

type ConfigurationObject = z.infer<typeof ConfigSchema>
// Remove the optional's `?` and `index signature` of the configuration object, and then it's done!
export const Value = ConfigValue<DeepRemoveIndexSignature<DeepRequired<ConfigurationObject>>> // (path: 'foo' | 'bar' | 'baz' | 'baz.qux', defaultValue?: unknown) => PropertyDecorator
```

And use it across your application.

# Author

- [Zero https://github.com/Groupguanfang](https://github.com/Groupguanfang)

## License

MIT
