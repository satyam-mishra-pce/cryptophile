import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const safeParse = <T>(data: string, fallback?: T): any => {
  try {
    return JSON.parse(data);
  } catch (error) {
    return fallback;
  }
};

export const isObject = (value: any): value is object => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof RegExp) &&
    !(value instanceof Date) &&
    !(value instanceof Set) &&
    !(value instanceof Map)
  );
};

type NonPrimitiveSpecialType = "array" | "regex" | "date" | "set" | "map";

export const getNonPrimitiveSpecialType = (
  value: any
): NonPrimitiveSpecialType | undefined => {
  if (Array.isArray(value)) return "array";
  if (value instanceof RegExp) return "regex";
  if (value instanceof Date) return "date";
  if (value instanceof Set) return "set";
  if (value instanceof Map) return "map";
  return undefined;
};

export const compareValuesByNonPrimitiveSpecialType = (
  valueType: NonPrimitiveSpecialType,
  value1: any,
  value2: any
) => {
  try {
    if (valueType === "array") {
      const [v1, v2] = [value1 as Array<any>, value2 as Array<any>];
      if (v1.length !== v2.length) return false;
      for (let i = 0; i < v1.length; i++) {
        if (!deepCompare(v1[i], v2[i])) return false;
      }
      return true;
    } else if (valueType === "regex") {
      return String(value1 as RegExp) === String(value2 as RegExp);
    } else if (valueType === "date") {
      return (value1 as Date).getTime() === (value2 as Date).getTime();
    } else if (valueType === "map") {
      const [v1, v2] = [value1 as Map<any, any>, value2 as Map<any, any>];
      if (v1.size !== v2.size) return false;
      for (const [key, value] of v1) {
        if (!v2.has(key)) return false;
        if (!deepCompare(value, v2[key as keyof typeof v2])) return false;
      }
      return true;
    } else {
      const [v1, v2] = [value1 as Set<any>, value2 as Set<any>];
      if (v1.size !== v2.size) return false;
      for (const key of v1) {
        if (!v2.has(key)) return false;
      }
      return true;
    }
  } catch {
    return false;
  }
};

export const deepCompare = (obj1: any, obj2: any) => {
  if (!(isObject(obj1) && isObject(obj2))) {
    if (typeof obj1 !== typeof obj2) return false;
    // return false;
    const nonPrimitiveSpecialType = getNonPrimitiveSpecialType(obj1);
    if (!nonPrimitiveSpecialType) return obj1 === obj2;
    return compareValuesByNonPrimitiveSpecialType(
      nonPrimitiveSpecialType,
      obj1,
      obj2
    );
  }
  const obj1Keys = new Set(Object.keys(obj1));
  const obj2Keys = Object.keys(obj2);
  if (obj1Keys.size !== obj2Keys.length) return false;
  for (let i = 0; i < obj2Keys.length; i++) {
    if (!obj1Keys.has(obj2Keys[i])) return false;
  }
  for (let i = 0; i < obj2Keys.length; i++) {
    if (
      !deepCompare(
        obj1[obj2Keys[i] as keyof typeof obj1],
        obj2[obj2Keys[i] as keyof typeof obj2]
      )
    )
      return false;
  }
  return true;
};
