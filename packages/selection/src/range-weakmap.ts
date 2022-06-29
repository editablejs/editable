import { RangeInterface } from "./range";
import { SelectionInterface } from "./types";

const RANGES_WEAK_MAP = new WeakMap<SelectionInterface, RangeInterface[]>()

export const addRanges = (selection: SelectionInterface, ...newRanges: RangeInterface[]) => { 
  const ranges = RANGES_WEAK_MAP.get(selection) ?? []
  ranges.push(...newRanges)
  RANGES_WEAK_MAP.set(selection, ranges)
}

export const getRanges = (selection: SelectionInterface) => {
  return RANGES_WEAK_MAP.get(selection) ?? []
}

export const clearRanges = (selection: SelectionInterface) => { 
  RANGES_WEAK_MAP.delete(selection)
}

export const getRangeCount = (selection: SelectionInterface) => { 
  return RANGES_WEAK_MAP.get(selection)?.length ?? 0
}

export const resetRanges = (selection: SelectionInterface, ...newRanges: RangeInterface[]) => { 
  RANGES_WEAK_MAP.set(selection, newRanges)
}


const CACHE_APPLY_RANGE = new WeakMap<SelectionInterface, RangeInterface>();

export const getCacheRange = (selection: SelectionInterface) => { 
  return CACHE_APPLY_RANGE.get(selection)
}

export const hasCacheRange = (selection: SelectionInterface) => { 
  return CACHE_APPLY_RANGE.has(selection)
}

export const setCacheRange = (selection: SelectionInterface, range: RangeInterface) => { 
  return CACHE_APPLY_RANGE.set(selection, range)
}

export const celarChacheRange = (selection: SelectionInterface) => { 
  CACHE_APPLY_RANGE.delete(selection)
}