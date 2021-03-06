[![Piral Logo](https://github.com/smapiot/piral/raw/master/docs/assets/logo.png)](https://piral.io)

# [Piral Dashboard](https://piral.io) &middot; [![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/smapiot/piral/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/piral-dashboard.svg?style=flat)](https://www.npmjs.com/package/piral-dashboard) [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://jestjs.io) [![Gitter Chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/piral-io/community)

This is plugin that only has a peer dependency to `piral-core`. What `piral-dashboard` brings to the table is a set of Pilet API extensions that can be used with `piral` or `piral-core`.

## Documentation

The following functions are brought to the Pilet API.

### `registerTile()`

Adds the definition of a tile to the app shell. Optionally specifies display characteristics like the initial rows, initial columns, or if the tile can be resized by the user.

If the first argument is a string a named tile is registered. A named tile can also be removed.

### `unregisterTile()`

Removes a tile from the app shell. This requires a named tile.

## Usage

::: summary: For pilet authors

You can use the `registerTile` function from the Pilet API to add a new tile in the app shell.

**Note**: When the first argument is a string we call it a *named* tile.

Example use:

```ts
import { PiletApi } from '<name-of-piral-instance>';
import { MyTile } from './MyTile';

export function setup(piral: PiletApi) {
  piral.registerTile(MyTile);
}
```

You can use the `unregisterTile` function from the Pilet API to remove a previously added tile from the app shell.

**Note**: You'll need to have added a *named* tile in order to be able to remove it.

Example use:

```ts
import { PiletApi } from '<name-of-piral-instance>';
import { MyTile } from './MyTile';

export function setup(piral: PiletApi) {
  // register with a name
  piral.registerTile('first', MyTile);
  // and unregister; maybe some time later?
  piral.unregisterTile('first');
}
```

:::

::: summary: For Piral instance developers

The provided library only brings API extensions for pilets to a Piral instance.

For the setup of the library itself you'll need to import `createDashboardApi` from the `piral-dashboard` package.

```ts
import { createDashboardApi } from 'piral-dashboard';
```

The integration looks like:

```ts
const instance = createInstance({
  // important part
  plugins: [createDashboardApi()],
  // ...
});
```

Via the options the `defaultPreferences` and the global / initially available `tiles` can be defined.

Consider for example:

```ts
const instance = createInstance({
  // important part
  plugins: [createDashboardApi({
    defaultPreferences: {
      initialColumns: 2,
      initialRows: 2,
      resizable: true,
    },
    tiles: [
      {
        component: MyTeaserTile,
        preferences: {
          initialColumns: 2,
          initialRows: 4,
        },
      },
    ],
  })],
  // ...
});
```

### Customizing

You can customize the available tiles and their options.

```ts
import 'piral-dashboard';

declare module 'piral-dashboard/lib/types' {
  interface PiralCustomTilePreferences {
    category?: string;
  }
}

// now registerTile(() => null, { category: 'general' }) is strongly typed in pilets
```

:::

## License

Piral is released using the MIT license. For more information see the [license file](./LICENSE).
