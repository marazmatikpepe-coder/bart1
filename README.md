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
Роутер выбирает модель по запросу и сам подтягивает актуальный список моделей из API:
- обычный текст → Groq `gpt-oss-120b` (рассуждение), запасные: Llama 3.3 70B, Qwen3;
- код (слова про код или файл .py/.js/…) → Groq (coder, иначе gpt-oss-120b);
- картинки → SambaNova vision (Llama 4 Maverick), запасная — Groq Llama 4;
- картинка + код/файл → два шага: vision описывает и читает текст, потом код-модель отвечает.
Под каждым ответом показано, какая модель отвечала.
Фото сжимаются и сохраняются на imgbb. Файлы: txt/md/код/json/csv, PDF (до 40 стр.), DOCX; в чат уходит до 12 000 символов файла.

## Безопасность ключей
Ключи в `js/config.js` видны любому, кто откроет сайт. Для публичного сайта их стоит заменить на ключи с лимитами или вынести на свой прокси.
