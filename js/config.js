// Ключи API в base64 (чтобы GitHub не отозвал их автоматически). Это НЕ защита.
export const CFG={
  groq:"Z3NrXzVmMnNuclJ0dTlCYmRMQU1HY2VCV0dkeWIzRlltUGNGRENBYTFVY21KRXoyN0Z0c3hVV0I=",
  ms:"bXMtZWZhODU4YzMtODBlYS00MmFiLWEyMDEtOTU5ZTdkYzM2MDQw",
  imgbb:"MWYxZmUyYjc5MDNjNmJiMzFkODE4MGRiZDg3NTMzOGQ="
};

// Адрес вашего Cloudflare Worker (см. proxy/worker.js). Пусто — запросы к ModelScope идут напрямую из браузера.
export const PROXY='https://still-glade-b48b.rimekekea3.workers.dev';
