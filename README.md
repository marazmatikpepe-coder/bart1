# Bart — веб-ассистент

Статический сайт (без сборки): работает на GitHub Pages.

## Запуск
1. Создайте репозиторий на GitHub, загрузите в него **содержимое** этой папки (index.html в корне).
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`. Через минуту сайт откроется по адресу `https://ИМЯ.github.io/РЕПО/`.
3. До подключения Firebase сайт работает в локальном режиме (чаты в браузере).

## Firebase (аккаунты и синхронизация)
1. Project settings → Your apps → Web (`</>`) → скопируйте `firebaseConfig` в `js/firebase-config.js`.
2. Authentication → Sign-in method: включите **Email/Password** и **Google** (для Google выберите адрес поддержки проекта). Вход по номеру телефона не используется.
3. Authentication → Settings → Authorized domains: добавьте домен GitHub Pages (`ИМЯ.github.io`) и домен, на котором реально размещён сайт.
4. Firestore Database → Rules:
```
rules_version = '2';
service cloud.firestore { match /databases/{d}/documents {
  match /users/{uid}/{document=**} { allow read, write: if request.auth != null && request.auth.uid == uid; }
}}
```
5. Realtime Database → Rules:
```
{ "rules": { "presence": { "$uid": { ".read": "auth != null && auth.uid == $uid", ".write": "auth != null && auth.uid == $uid" } } } }
```
Почта: Firebase шлёт **ссылку** подтверждения (не код); текст письма меняется в Authentication → Templates. На телефонах вход Google использует перенаправление, на компьютерах — всплывающее окно. Если вход не работает, проверьте Authorized domains и включённый Google provider.

## Как работают модели
Сайт сам берёт актуальный список моделей из Groq и выбирает подходящую (названия не зашиты, устаревшие модели пропускаются):
- текст → Groq `gpt-oss-120b` (рассуждение), запасные: Llama 3.3 70B, Qwen;
- код → Groq coder-модель, иначе gpt-oss-120b;
- картинки на входе → Groq vision (сейчас `qwen/qwen3.8-27b`; Llama 4 Scout Groq закрыл);
- картинка + код/файл → два шага: vision читает картинку, потом код-модель отвечает;
- «нарисуй…» / «сгенерируй картинку» → Groq переводит запрос в детальный английский промпт, рисует Pollinations (flux), картинка сохраняется на imgbb. Бесплатный лимит Pollinations — 1 картинка в ~15 секунд.
SambaNova не используется: её API блокирует запросы из браузера (CORS). Нужен свой прокси-сервер.
Под каждым ответом показана модель. Файлы: txt/md/код/json/csv, PDF (до 40 стр.), DOCX; в чат уходит до 12 000 символов.

## Ваши иконки
Сайт сначала показывает встроенные иконки, а если в `assets/icons/` лежит `ИМЯ.png` (menu, plus, send, attachFile, camera, delete, search, copyIcon, download, close), подставляет вашу.
Скачать все 105 иконок в репозиторий: вкладка **Actions → Fetch icons → Run workflow** (список в `icons.txt`). Если Actions не даёт писать: Settings → Actions → General → Workflow permissions → Read and write.
Или положите PNG в `assets/icons/` вручную.

## Файлы, ZIP, голос
- Читает: PDF (текст с сохранением строк таблиц; сканы без текста отправляются как картинки страниц в vision), DOCX, DOC (приблизительно), TXT, RTF, ODT, HTML, EPUB, CSV, XLSX/XLS/ODS (значения ячеек по листам, формулы не показываются), JSON, XML, YAML, TOML, PPTX (текст слайдов), MD, IPYNB, ZIP (список файлов + текст кода внутри), любой текстовый файл и код; картинки JPG/PNG/GIF/WEBP.
- В чат уходит до 12 000 символов файла, дальше текст обрезается.
- Создание ZIP: попросите «создай проект …» — Bart выдаёт каждый файл отдельным блоком с именем, под ответом появляется кнопка «ZIP».
- Голос: кнопка микрофона записывает речь, текст вставляется в поле ввода (распознавание Whisper). Нужен HTTPS (GitHub Pages подходит) и разрешение на микрофон.

## Безопасность ключей
Ключи в `js/config.js` видны любому, кто откроет сайт. Для публичного сайта их стоит заменить на ключи с лимитами или вынести на свой прокси.


## ModelScope: DeepSeek-V4 and Qwen-Image

The frontend is static GitHub Pages, so **do not put the ModelScope token in `js/config.js`**. A browser-side token would be visible to every visitor. Use the included Cloudflare Worker proxy:

1. Create a Cloudflare Worker and paste `worker/model-scope-worker.js` into it.
2. In Worker Settings → Variables and Secrets, add a secret named `MODELSCOPE_TOKEN` with your ModelScope token.
3. Deploy the Worker. Copy its HTTPS URL.
4. In both `js/config.js` (the active config) set `modelApi: "https://YOUR-WORKER.workers.dev"`. Keep the URL without a trailing slash. Commit and push.
5. The Worker uses `deepseek-ai/DeepSeek-V4.1-Flash` for chat/code and `Qwen/Qwen-Image` for image generation. Model availability depends on the ModelScope account/API inference access.

The Worker allows CORS for the static frontend. For a public deployment, restrict `Access-Control-Allow-Origin` to your GitHub Pages origin and add basic rate limiting before sharing widely. Never commit the token itself.

### What the file reader currently understands

Images; PDF; DOCX and approximate legacy DOC; XLS/XLSX/XLSM/ODS; PPTX; ODT; EPUB; ZIP file lists and text/code files inside archives; RTF; HTML; Jupyter notebooks; and plain text/source-code formats. Binary files outside these supported readers can still be attached, but the assistant receives the file name/type rather than a guaranteed full extraction. A chat attachment card is a visual record; original non-image file bytes are not uploaded to a download service.

### Request and context stability

The frontend now limits chat history to recent turns and caps extracted file text before sending. A 429 from ModelScope still means a provider-side rate limit and should be retried after a pause. The API token is only used by the Worker, never by client JavaScript.
