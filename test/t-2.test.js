const {types} = require("node:util");
const http = require('http');
const {BatchInterceptor} = require("@mswjs/interceptors");
const {default: nodeInterceptors} = require("@mswjs/interceptors/presets/node");

function getGlobalSymbol(symbolDescriptor) {
  return Object.getOwnPropertySymbols(globalThis).find((s) => s.toString() === `Symbol(${symbolDescriptor})`);
}

test('two', async () => {
  // proves globalThis is reset between tests:
  const globalPersistedFromPreviousTest = typeof globalThis.something !== 'undefined';
  const globalMSWSymbolPersistedOnLoad = typeof getGlobalSymbol('client-request-interceptor') !== 'undefined';
  const nativeHttpRequestIsProxyOnLoad = types.isProxy(http.request);

  const proxyRef1 = http.request;

  // create and apply new interceptor to see what happens to the proxy
  const interceptor = new BatchInterceptor({
    name: 'test-interceptor',
    interceptors: nodeInterceptors,
  })
  // because the globalThis[Symbol] isn't persisted between tests, the http.* proxies will be applied again:
  interceptor.apply();

  const proxyRef2 = http.request;
  const secondApplyCreatesNewProxy = proxyRef1 !== proxyRef2;

  // will remove the 'top' proxy but leave the one created in the first test:
  interceptor.dispose();

  const nativeHttpRequestIsStillProxyAfterDispose = types.isProxy(http.request);
  expect({
    globalPersistedFromPreviousTest,
    globalMSWSymbolPersistedOnLoad,
    nativeHttpRequestIsProxyOnLoad,
    secondApplyCreatesNewProxy,
    nativeHttpRequestIsStillProxyAfterDispose
  }).toEqual({
    globalPersistedFromPreviousTest: true,
    globalMSWSymbolPersistedOnLoad: true,
    nativeHttpRequestIsProxyOnLoad: true,
    secondApplyCreatesNewProxy: false,
    nativeHttpRequestIsStillProxyAfterDispose: false
  })
});
