export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));