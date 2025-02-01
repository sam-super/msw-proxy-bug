# msw node client-request proxy bug

MSW's attempt to use `globalThis` to maintain a single instance of each interceptor won't work in jest via nodejs because by default it resets the `globalThis` object.

Jest is also resetting the module cache between each test, but it doesn't reset the native-module cache.

As a result, the Proxy that is used to intercept the http(s) methods (`http.request` etc) can end up stacking on top of each other, causing strange behaviour. 

This repo is to demonstrate that scenario in the tests. 
E.g.
```
npm install
npm run test
```

You should see the tests fail on a few expectations around global state and the state of the http.request proxy:
<img width="424" alt="image" src="https://github.com/user-attachments/assets/05b1e894-46c6-4471-ada3-3d51e97c9295" />


Ideally maybe jest should reset the native-module cache between each test to remove any state that is attached (i.e. the interceptor proxy added my msw). Not sure how feasible it will be though. Jest's own `jest.resetModules();` method doesn't reset native modules.

Note: Because the `FetchInterceptor` is bound to globalFetch, it currently behaves differently from `ClientRequestInterceptor` (which is bound to the http module cache), and so the stacking doesn't happen.

More background: https://github.com/mswjs/interceptors/pull/697

Note: because jest randomly picks the test order, we have setup a deterministic test sequences to control the order the tests run in.
