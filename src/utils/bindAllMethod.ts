import { bindAll } from 'lodash';

export function bindAllMethods<T>(object: T): T {
  return bindAll(object, getAllMethods(object));
}

// don't look below here, evil awaits you
function getAllMethods(object: unknown): string[] {
  return getAllMethodsHelper(object).filter(
    (prop) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prop !== 'constructor' && typeof (object as any)[prop] === 'function'
  );
}

function getAllMethodsHelper(object: unknown): string[] {
  const props = Object.getOwnPropertyNames(object);
  if (Object.getPrototypeOf(object) !== null) {
    props.push(...getAllMethodsHelper(Object.getPrototypeOf(object)));
  }
  return props;
}
