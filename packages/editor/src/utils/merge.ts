type MergeableObject = object | any[];

interface MergeOptions {
  clone?: boolean;
  isMergeableObject?: (value: any) => value is MergeableObject;
  arrayMerge?: (target: any[], source: any[], options: MergeOptions) => any[];
  customMerge?: (key: string) => ((x: any, y: any, options: MergeOptions) => any) | undefined;
}

const defaultIsMergeableObject = (value: any): value is MergeableObject => {
  const isNonNullObject = value !== null && typeof value === 'object';
  return isNonNullObject && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof RegExp);
}

const emptyTarget = (val: any) => Array.isArray(val) ? [] : {};

const cloneUnlessOtherwiseSpecified = (value: any, options: MergeOptions): any =>
  (options.clone !== false && options.isMergeableObject!(value))
    ? merge(emptyTarget(value), value, options)
    : value;

const defaultArrayMerge = (target: any[], source: any[], options: MergeOptions) =>
  target.concat(source).map(element => cloneUnlessOtherwiseSpecified(element, options));

const getMergeFunction = (key: string, options: MergeOptions) => {
  if (!options.customMerge) {
    return merge;
  }
  const customMerge = options.customMerge(key);
  return typeof customMerge === 'function' ? customMerge : merge;
}

const getEnumerableOwnPropertySymbols = (target: object) =>
  Object.getOwnPropertySymbols
    ? Object.getOwnPropertySymbols(target).filter(symbol => Object.propertyIsEnumerable.call(target, symbol))
    : [];

const getKeys = (target: object) => Object.keys(target).concat(getEnumerableOwnPropertySymbols(target).map(symbol => symbol.toString()));

const propertyIsOnObject = (object: object, property: string | symbol) => {
  try {
    return property in object;
  } catch (_) {
    return false;
  }
}

const propertyIsUnsafe = (target: object, key: string | symbol) =>
  propertyIsOnObject(target, key) &&
  !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));

const mergeObject = (target: object, source: object, options: MergeOptions) => {
  const destination: any = {};
  if (options.isMergeableObject!(target)) {
    getKeys(target).forEach(key => {
      destination[key as string] = cloneUnlessOtherwiseSpecified(target[key as keyof typeof target], options);
    });
  }
  getKeys(source).forEach(key => {
    if (propertyIsUnsafe(target, key)) {
      return;
    }

    if (propertyIsOnObject(target, key) && options.isMergeableObject!(source[key as keyof typeof source])) {
      destination[key] = getMergeFunction(key, options)(target[key as keyof typeof target], source[key as keyof typeof source], options);
    } else {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key as keyof typeof source], options);
    }
  });
  return destination;
}

export const merge = (target: any, source: any, options: MergeOptions = {}) => {
  options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  options.isMergeableObject = options.isMergeableObject || defaultIsMergeableObject;

  const sourceIsArray = Array.isArray(source);
  const targetIsArray = Array.isArray(target);
  const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, options);
  } else if (sourceIsArray) {
    return options.arrayMerge(target, source, options);
  } else {
    return mergeObject(target, source, options);
  }
}
