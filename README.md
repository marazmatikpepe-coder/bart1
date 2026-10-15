# Bart — веб-ассистент

Статический сайт (без сборки): работает на GitHub Pages.

## Запуск
1. Создайте репозиторий на GitHub, загрузите в него **содержимое** этой папки (index.html в корне).
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`. Через минуту сайт откроется по адресу `https://ИМЯ.github.io/РЕПО/`.
3. До подключения Firebase сайт работает в локальном режиме (чаты в браузере).

## Firebase (аккаунты и синхронизация)
1. Project settings → Your apps → Web (`</>`) → скопируйте `firebaseConfig` в `js/firebase-config.js`.
2. Authentication → Sign-in method: включите **Email/Password** и **Phone**.
3. Authentication → Settings → Authorized domains: добавьте `ИМЯ.github.io`.
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
Почта: Firebase шлёт **ссылку** подтверждения (не код); текст письма меняется в Authentication → Templates.
Телефон: SMS-код; для проверки без SMS добавьте тестовые номера в Authentication → Phone.

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
