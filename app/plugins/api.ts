export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    onRequest({ options }) {
      const clientCookies = useRequestHeaders(["cookie"]);
      if (clientCookies.cookie) {
        options.headers.set("cookie", clientCookies.cookie);
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
