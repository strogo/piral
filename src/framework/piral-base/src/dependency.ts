import type { PiletApp, AvailableDependencies, PiletExports, PiletMetadataV1 } from './types';

function requireModule(name: string, dependencies: AvailableDependencies) {
  const dependency = dependencies[name];

  if (!dependency) {
    const error = new Error(`Cannot find module '${name}'`);
    (error as any).code = 'MODULE_NOT_FOUND';
    throw error;
  }

  return dependency;
}

function checkPiletApp(name: string, app?: PiletApp): PiletApp {
  if (!app) {
    console.error('Invalid module found.', name);
  } else if (typeof app.setup !== 'function') {
    console.warn('Setup function is missing.', name);
  } else {
    return app;
  }

  return {
    setup() {},
  };
}

function checkPiletAppAsync(name: string, app?: PiletApp | Promise<PiletApp>): Promise<PiletApp> {
  return Promise.resolve(app).then(resolvedApp => checkPiletApp(name, resolvedApp));
}

function getLocalRequire(dependencies: AvailableDependencies = {}) {
  return (moduleName: string) => requireModule(moduleName, dependencies);
}

/**
 * Compiles the given content from a generic dependency.
 * @param name The name of the dependency to compile.
 * @param content The content of the dependency to compile.
 * @param link The optional link to the dependency.
 * @param dependencies The globally available dependencies.
 * @returns The evaluated dependency.
 */
export function evalDependency(name: string, content: string, link = '', dependencies?: AvailableDependencies) {
  const mod = {
    exports: {},
  } as PiletExports;
  const require = getLocalRequire(dependencies);

  try {
    const sourceUrl = link && `\n//# sourceURL=${link}`;
    const importer = new Function('module', 'exports', 'require', content + sourceUrl);
    importer(mod, mod.exports, require);
  } catch (e) {
    console.error(`Error while evaluating ${name}.`, e);
  }

  return mod.exports;
}

/**
 * Compiles the given content from a module with a dependency resolution.
 * @param name The name of the dependency to compile.
 * @param content The content of the dependency to compile.
 * @param link The optional link to the dependency.
 * @param dependencies The globally available dependencies.
 * @returns The evaluated module.
 */
export function compileDependency(
  name: string,
  content: string,
  link = '',
  dependencies?: AvailableDependencies,
): Promise<PiletApp> {
  const app = evalDependency(name, content, link, dependencies);
  return checkPiletAppAsync(name, app);
}

declare global {
  interface HTMLScriptElement {
    app?: PiletApp;
  }
}

/**
 * Includes the given script via its URL with a dependency resolution.
 * @param meta The meta data of the dependency to include.
 * @param dependencies The globally available dependencies.
 * @returns The evaluated module.
 */
export function includeDependency(meta: PiletMetadataV1, dependencies?: AvailableDependencies) {
  return new Promise<PiletApp>(resolve => {
    const rr = meta.requireRef;
    const s = document.createElement('script');
    s.async = true;
    s.src = meta.link;

    if (meta.integrity) {
      s.crossOrigin = 'anonymous';
      s.integrity = meta.integrity;
    }

    window[rr] = getLocalRequire(dependencies);
    s.onload = () => resolve(checkPiletAppAsync(meta.name, s.app));
    s.onerror = () => resolve(checkPiletApp(meta.name));
    document.body.appendChild(s);
  });
}
