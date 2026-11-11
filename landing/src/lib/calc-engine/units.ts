export const UNITS = ['m2', 'm', 'm3', 'mm', 'pcs', 'bag', 'bucket', 'canister', 'sheet', 'set', 'pack', 'packet', 'roll', 'kg', 'l'] as const;

export type Unit = (typeof UNITS)[number];
