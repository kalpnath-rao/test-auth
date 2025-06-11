// polyfill functions

global.formatEnum = function (target: object): string {
  return Object.entries(target)
    .map(([k, v]) => `${v}: ${k}`)
    .join(', ');
};

global.e = function (str: string): string {
  return process.env.NODE_ENV + str;
};
