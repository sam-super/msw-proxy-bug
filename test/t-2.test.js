const {types} = require("node:util");
const http = require('http');
const {BatchInterceptor} = require("@mswjs/interceptors");
const {default: nodeInterceptors} = require("@mswjs/interceptors/presets/node");

function getGlobalSymbol(symbolDescriptor) {
  return Object.getOwnPropertySymbols(globalThis).find((s) => s.toString() === `Symbol(${symbolDescriptor})`);
}
test('two', async () => {
  // proves globalThis is reset between tests:
  expect(globalThis.something).toBeUndefined();
  expect(getGlobalSymbol('client-request-interceptor')).toBeUndefined();
  // proves the native module is still proxied:
  expect(types.isProxy(http.request)).toBe(true);
  const proxyRef1 = http.request;

  // create and apply new interceptor to see what happens to the proxy
  const interceptor = new BatchInterceptor({
    name: 'test-interceptor',
    interceptors: nodeInterceptors,
  })
  interceptor.apply();
  const proxyRef2 = http.request;

  expect(proxyRef1).not.toStrictEqual(proxyRef2);
  // will remove the 'top' proxy
  interceptor.dispose();

  // proves even after dispose the method is still a proxy:
  expect(types.isProxy(http.request)).toBe(true);
  // shows the proxy is the underlying/stacked-upon proxy:
  expect(http.request).not.toStrictEqual(proxyRef2);
  expect(http.request).toStrictEqual(proxyRef1);
});
