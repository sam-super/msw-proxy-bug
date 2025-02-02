const {default: nodeInterceptors} = require("@mswjs/interceptors/presets/node");
const {BatchInterceptor} = require("@mswjs/interceptors");
const {types} = require("node:util");
const http = require("http");

function getGlobalSymbol(symbolDescriptor) {
  return Object.getOwnPropertySymbols(globalThis).find((s) => s.toString() === `Symbol(${symbolDescriptor})`);
}

test('one', async () => {
  globalThis.something = 'set in test one';
  expect(getGlobalSymbol('client-request-interceptor')).toBeUndefined();
  const interceptor = new BatchInterceptor({
    name: 'test-interceptor',
    interceptors: nodeInterceptors,
  })
  interceptor.apply();
  expect(getGlobalSymbol('client-request-interceptor')).toBeDefined();
  expect(types.isProxy(http.request)).toBe(true);
});
