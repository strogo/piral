import * as React from 'react';
import { Provider } from 'urql';
import type { PiralPlugin, GlobalStateContext } from 'piral-core';
import { gqlQuery, gqlMutation, gqlSubscription } from './queries';
import { setupGqlClient } from './setup';
import { PiletGqlApi, UrqlClient, GqlOperationOptions } from './types';

function extendOptions<T extends GqlOperationOptions>(context: GlobalStateContext, options: T): Promise<T> {
  const originalHeaders = options.headers || {};
  const headerPromises: Array<Promise<Record<string, string>>> = [];

  context.emit('before-fetch', {
    headers: originalHeaders,
    setHeaders(headers: Promise<any> | any) {
      if (headers) {
        headerPromises.push(headers);
      }
    },
  });

  return Promise.all(headerPromises).then(newHeaders => {
    const headers = newHeaders.reduce((obj, header) => {
      if (typeof header === 'object' && header) {
        return {
          ...obj,
          ...header,
        };
      }

      return obj;
    }, originalHeaders);

    return {
      ...options,
      headers,
    };
  });
}

function defaultGqlClient() {
  if (typeof window !== 'undefined') {
    return setupGqlClient();
  } else {
    return undefined;
  }
}

/**
 * Creates new Pilet API extensions for GraphQL.
 * @param client The specific urql client to be used, if any.
 */
export function createGqlApi(client: UrqlClient = defaultGqlClient()): PiralPlugin<PiletGqlApi> {
  return context => {
    context.includeProvider(<Provider value={client} />);

    return {
      query(q, o = {}) {
        return extendOptions(context, o).then(options => gqlQuery(client, q, options));
      },
      mutate(q, o = {}) {
        return extendOptions(context, o).then(options => gqlMutation(client, q, options));
      },
      subscribe(q, subscriber, o = {}) {
        const unsubscribe = extendOptions(context, o).then(options => gqlSubscription(client, q, subscriber, options));
        return () => unsubscribe.then(cb => cb());
      },
    };
  };
}
