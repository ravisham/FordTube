const toString = Object.prototype.toString;

/**
 *
 * @summary Recursively remove any null or empty properties
 */
export function removeEmptyProperties<T>(sourceObject: T, options: { omitZero: boolean } = { omitZero: true }): T {
  const omitZero = options ? options.omitZero : false;

  const omit = (value: any) => {
    if (Array.isArray(value)) {
      value = value.map(v => omit(v)).filter(v => !isNullOrEmpty(v, omitZero));
    }

    if (kindOf(value) === 'object') {
      const res: { [key: string]: any } = {}; // Add index signature to the type of 'res' object
      for (const key of Object.keys(value)) {
        const val = omit(value[key]);
        if (val !== void 0) {
          res[key] = val;
        }
      }
      value = res;
    }

    if (!isNullOrEmpty(value, omitZero)) {
      return value;
    }
  };

  const result = omit(sourceObject);
  if (result === void 0) {
    return kindOf(sourceObject) === 'object' ? {} : result;
  }
  return result;
}

/**
 *
 * @summary Determines whether or not the given parameter is empty
 *
 */
export function isNullOrEmpty(value: any, omitZero: boolean = true): boolean {
  switch (kindOf(value)) {
    case 'null':
    case 'undefined':
      return true;
    case 'boolean':
    case 'function':
    case 'date':
    case 'regexp':
      return false;
    case 'string':
    case 'arguments':
      return value.length === 0;
    case 'file':
    case 'map':
    case 'set':
      return value.size === 0;
    case 'number':
      return omitZero ? value === 0 : false;
    case 'error':
      return value.message === '';
    case 'array':
      for (const ele of value) {
        if (!isNullOrEmpty(ele, omitZero)) {
          return false;
        }
      }
      return true;
    case 'object':
      for (const key of Object.keys(value)) {
        if (!isNullOrEmpty(value[key], omitZero)) {
          return false;
        }
      }
      return true;
    default: {
      return true;
    }
  }
}

/**
 *
 * @summary Determines the type of the given parameter
 *
 */
export function kindOf(val: any): string {
  if (val === void 0) {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }

  const type = typeof val;
  if (type === 'boolean') {
    return 'boolean';
  }
  if (type === 'string') {
    return 'string';
  }
  if (type === 'number') {
    return 'number';
  }
  if (type === 'symbol') {
    return 'symbol';
  }
  if (type === 'function') {
    return isGeneratorFn(val) ? 'generatorfunction' : 'function';
  }

  if (isArray(val)) {
    return 'array';
  }
  if (isBuffer(val)) {
    return 'buffer';
  }
  if (isArguments(val)) {
    return 'arguments';
  }
  if (isDate(val)) {
    return 'date';
  }
  if (isError(val)) {
    return 'error';
  }
  if (isRegexp(val)) {
    return 'regexp';
  }

  switch (ctorName(val)) {
    case 'Symbol':
      return 'symbol';
    case 'Promise':
      return 'promise';

    // Set, Map, WeakSet, WeakMap
    case 'WeakMap':
      return 'weakmap';
    case 'WeakSet':
      return 'weakset';
    case 'Map':
      return 'map';
    case 'Set':
      return 'set';

    // 8-bit typed arrays
    case 'Int8Array':
      return 'int8array';
    case 'Uint8Array':
      return 'uint8array';
    case 'Uint8ClampedArray':
      return 'uint8clampedarray';

    // 16-bit typed arrays
    case 'Int16Array':
      return 'int16array';
    case 'Uint16Array':
      return 'uint16array';

    // 32-bit typed arrays
    case 'Int32Array':
      return 'int32array';
    case 'Uint32Array':
      return 'uint32array';
    case 'Float32Array':
      return 'float32array';
    case 'Float64Array':
      return 'float64array';
  }

  if (isGeneratorObj(val)) {
    return 'generator';
  }

  // Non-plain objects
  const returnType = toString.call(val);
  switch (returnType) {
    case '[object Object]':
      return 'object';
    // iterators
    case '[object Map Iterator]':
      return 'mapiterator';
    case '[object Set Iterator]':
      return 'setiterator';
    case '[object String Iterator]':
      return 'stringiterator';
    case '[object Array Iterator]':
      return 'arrayiterator';
  }

  // other
  return returnType
    .slice(8, -1)
    .toLowerCase()
    .replace(/\s/g, '');
}

/**
 *
 * @summary Gets the name of the constructor
 *
 */
export function ctorName(val: any): string {
  return val.constructor ? val.constructor.name : null;
}

/**
 *
 * @summary Determines whether or not the given parameter is an array
 *
 */
export function isArray(val: any): boolean {
  if (Array.isArray) {
    return Array.isArray(val);
  }
  return val instanceof Array;
}

/**
 *
 * @summary Determines whether or not the given parameter is an error
 *
 */
export function isError(val: any): boolean {
  return val instanceof Error || (typeof val.message === 'string' && val.constructor && typeof val.constructor.stackTraceLimit === 'number');
}

/**
 *
 * @summary Determines whether or not the given parameter is a boolean
 *
 */
export function isDate(val: any): boolean {
  if (val instanceof Date) {
    return true;
  }
  return typeof val.toDateString === 'function' && typeof val.getDate === 'function' && typeof val.setDate === 'function';
}

/**
 *
 * @summary Determines whether or not the given parameter is a Regular Expression
 *
 */
export function isRegexp(val: any): boolean {
  if (val instanceof RegExp) {
    return true;
  }
  return typeof val.flags === 'string' && typeof val.ignoreCase === 'boolean' && typeof val.multiline === 'boolean' && typeof val.global === 'boolean';
}

/**
 *
 * @summary Determines whether or not the given parameter is a Generator Function
 *
 */
export function isGeneratorFn(name: any): boolean {
  return ctorName(name) === 'GeneratorFunction';
}

/**
 *
 * @summary Determines whether or not the given parameter is a Generator Function
 *
 */
export function isGeneratorObj(val: any): boolean {
  return typeof val.throw === 'function' && typeof val.return === 'function' && typeof val.next === 'function';
}

/**
 *
 * @summary Determines whether or not the given parameter is a set of arguments
 *
 */
export function isArguments(val: any): boolean {
  try {
    if (typeof val.length === 'number' && typeof val.callee === 'function') {
      return true;
    }
  } catch (err) {
    if ((err as Error).message.indexOf('callee') !== -1) {
      return true;
    }
  }
  return false;
}

/**
 *
 * @summary Determines whether or not the given parameter is a buffer
 *
 */
export function isBuffer(val: any): boolean {
  if (val.constructor && typeof val.constructor.isBuffer === 'function') {
    return val.constructor.isBuffer(val);
  }
  return false;
}
