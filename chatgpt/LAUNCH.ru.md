# Подключение и публикация Levelry в ChatGPT

Инструкция сверена с официальной документацией 30 сентября 2026 года.
Код находится в `canvas_new2/main`, `LevelryUnifiedServer/master` и
`levelry-docs/master`. Миграция `20260930160000_chatgpt_oauth_clients.sql`
применена к производственной Supabase. Повторять её вручную не нужно.
Фронтенд публикует готовый редактор по адресу
`https://go.levelry.app/chatgpt/index.html`.

Осталось включить настройки сервера, подключить Levelry в своём ChatGPT,
проверить его в настоящем клиенте и затем отправить пакет на публичное ревью.
Использование AI здесь идёт через разговор с ChatGPT; ключ OpenAI API
для этого подключения не нужен. Самостоятельный сайт Levelry продолжает
использовать свой существующий AI-механизм.

## 1. Включить сервер в DigitalOcean

Открой [Apps](https://cloud.digitalocean.com/apps), приложение сервера,
затем **Settings → компонент api → Environment Variables → Edit**.
Добавь значения ниже со scope **Run time**. Для секрета выбери **Encrypt**.
Так устроена [настройка переменных App Platform](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/).

| Key | Value |
| --- | --- |
| `CHATGPT_ENABLED` | `true` |
| `CHATGPT_UI_SESSION_SECRET` | Результат команды `openssl rand -hex 32` на своём компьютере |
| `CHATGPT_UI_HTML_URL` | `https://go.levelry.app/chatgpt/index.html` |
| `CHATGPT_OAUTH_REDIRECT_URIS` | `https://chatgpt.com/connector_platform_oauth_redirect` |
| `MCP_OAUTH_ISSUER` | `https://levelry-server-hvyc5.ondigitalocean.app` |
| `MCP_OAUTH_UI_URL` | `https://go.levelry.app` |

Секрет вставляется только в DigitalOcean. Не добавляй его в Git, Vite,
публичный ZIP или переписку. Существующие Supabase-переменные и
`DATABASE_URL` оставь с производственными значениями. Порт базы должен
быть 5432 или session-mode pooler, как и у текущего v3-сервера.

Сохрани настройки и дождись завершения нового деплоя. Если сохранение
не запустило выкладку, выполни **Deploy** из панели приложения.
Проверь сервер этой командой:

```bash
curl -i -X POST \
  https://levelry-server-hvyc5.ondigitalocean.app/mcp/chatgpt \
  -H 'Content-Type: application/json' --data '{}'
```

Без авторизации ожидается **401** и заголовок `WWW-Authenticate` с
`resource_metadata`. **404** означает, что интеграция ещё выключена либо
работает старая версия. **500/503** требуют проверки runtime logs.
Переход по MCP-URL в адресной строке браузера не проверяет работу MCP:
он рассчитан на POST и OAuth.

## 2. Создать своё подключение в ChatGPT

Включи **Settings → Security and login → Developer mode**.
Открой [ChatGPT Plugins](https://chatgpt.com/plugins) в обычном браузере,
нажми **+** и выбери **Create MCP app**. Create plugin запускает создание
пакета через агента; Upload plugin archive загружает готовый пакет.
Доступность developer mode зависит от аккаунта и правил workspace.
Это текущий [процесс подключения OpenAI](https://developers.openai.com/plugins/deploy/connect-chatgpt).

| Поле | Что вводить |
| --- | --- |
| Name | `Levelry` |
| Description | `Create and edit notes, plans, and diagrams on a visual canvas.` |
| Connection | Публичный HTTPS MCP server |
| MCP server URL | `https://levelry-server-hvyc5.ondigitalocean.app/mcp/chatgpt` |
| Authentication | `OAuth` |
| OAuth registration | Dynamic Client Registration / DCR, если интерфейс предлагает выбор |
| Client ID / Client Secret | Не вводить вручную: сервер поддерживает DCR |

Создай подключение, войди в свой Levelry-аккаунт на странице авторизации
и выдай **read/write**, если хочешь создавать и редактировать. При
read-only редактор и инструменты записи будут ограничены. Для отдельного
ChatGPT-подключения сервер допускает бесплатный Levelry-аккаунт и
авторизацию до создания первого проекта.

Если ChatGPT показал другой callback, скопируй **точный Redirect URI**
из настроек подключения в `CHATGPT_OAUTH_REDIRECT_URIS` на DigitalOcean.
Несколько разрешённых URI разделяются запятыми. Не добавляй wildcard.
После сохранения и выкладки повтори OAuth. Сервер поддерживает RFC 9207,
поэтому ожидается стабильный callback из таблицы выше; однако ориентируйся
на значение конкретного подключения.
[Правила callback и DCR](https://developers.openai.com/plugins/build/auth).

## 3. Установить полный пакет для локальной проверки

Открой созданное подключение в браузере и скопируй его URL или технический
ID `asdk_app_…`. В некоторых представлениях ID имеет префикс
`plugin_asdk_app_…`; скрипт преобразует его в канонический `asdk_app_…`.
Подставь свой реальный ID вместо `asdk_app_REPLACE_ME`:

```bash
cd /Users/maciggi/projects/levelry-docs
node scripts/register-chatgpt.mjs asdk_app_REPLACE_ME
node scripts/validate-plugin.mjs
```

Скрипт создаёт `.app.json` и связывает пакет с твоим подключением.
Это не OAuth-секрет. Не запускай скрипт с примером из инструкции.
Пакет и repo marketplace уже лежат в этом репозитории.

Для личной установки через **Upload plugin archive** можно собрать архив
с привязкой к зарегистрированному MCP app:

```bash
node scripts/package-plugin.mjs --private
```

Результат: `releases/levelry-plugin-0.1.0-private.zip`. Этот вариант сохраняет
`.app.json`; для публичного submission используются отдельные `--draft`
и `--submission`, которые убирают привязку из ZIP-копии.

Сам MCP app может открыть редактор уже по адресу
`https://chatgpt.com/mcp-app/asdk_app_…/openLevelry` до установки полного
пакета со skill. После открытия выбери проект, сделай одно ручное изменение
и проверь его сохранение в том же проекте на обычном сайте Levelry.

Открой `levelry-docs` как локальный проект в ChatGPT desktop/Work,
перезапусти клиент, затем в Plugins Directory выбери источник
**Levelry Private Preview** и установи **Levelry**. Если источник не
показывается, можно поручить Plugin Creator добавить готовый пакет
`/Users/maciggi/projects/levelry-docs/plugins/levelry` в персональный
marketplace, сохранив зарегистрированный ID.
Это соответствует [локальному механизму установки пакетов](https://developers.openai.com/plugins/build/plugins).

В новой беседе выбери Levelry и напиши **«Открой мой Levelry canvas»**.
Проверь также запуск из сайдбара: у `openLevelry` объявлены global и
thread entrypoints. Конкретное отображение зависит от версии и доступности
extensions в клиенте. Внутри редактора выбери проект, отредактируй заметку,
затем попроси ChatGPT добавить объекты. Открой второй проект в другой
беседе и убедись, что изменения попадают в правильный проект.

Полный набор сценариев находится в [REVIEW-CASES.md](REVIEW-CASES.md).
Проверки в настоящем ChatGPT пока не выполнены: локальные автоматические
тесты не подтверждают внешний OAuth и отображение сайдбара.

Если публикуешь только внутри своего workspace и являешься его админом:
**Plugins → Personal → меню плагина → Publish**, затем выбери роли.
Это отдельный путь от публичного каталога.
[Публикация в workspace](https://developers.openai.com/plugins/build/plugins#publish-a-local-plugin-to-your-workspace).

## 4. Подготовить публичную загрузку

Пакет уже содержит название, тексты, Productivity-категорию, иконки,
MCP URL, skill и пять положительных / три отрицательных сценария.
Сценарии описывают ожидаемое поведение; они ещё требуют живого прогона.

Перед ревью добавь в `plugins/levelry/plugin.json` реальные доступные URL
в `extensions.com.openai.interface`: `supportURL`, `privacyPolicyURL`,
`termsOfServiceURL`. `websiteURL` уже задан. В
`extensions.com.openai.review.demo_recording_url` добавь ссылку на видео
работы плагина. Иконки есть, снимки экрана можно добавить через
`interface.screenshots`; по текущей документации они необязательны.

Подготовь отдельный Levelry-аккаунт для ревью с паролем, правами записи
и демонстрационными проектами. Проверь вход без недоступного ревьюеру
MFA, кодов email/SMS или magic link. Логин и пароль вводятся отдельно в
портале, а не в manifest или Git.

Для публичного UI установи на DigitalOcean `CHATGPT_UI_DOMAIN`:
выделенный HTTPS-origin для Levelry-плагина, например
`https://chatgpt.levelry.app`, после настройки и подтверждения этого
домена. Это настройка origin компонента, а не замена MCP URL.
Домен должен быть уникальным для плагина.
[Требование UI domain](https://developers.openai.com/plugins/reference#component-resource-_meta-fields).

Собери ZIP:

```bash
cd /Users/maciggi/projects/levelry-docs
node scripts/validate-plugin.mjs
node scripts/package-plugin.mjs --draft
```

Результат: `releases/levelry-plugin-0.1.0-draft.zip`. Его можно загрузить
как черновик и увидеть замечания. После заполнения материалов используй:

```bash
node scripts/package-plugin.mjs --submission
```

Результат: `releases/levelry-plugin-0.1.0.zip`. Скрипт проверяет наличие
основных полей; он не проверяет живой вход и не заменяет ревью.
Он удаляет `.app.json` и `extensions.com.openai.apps` только из ZIP-копии:
публичная загрузка принимает URL MCP, а привязка к существующему
ChatGPT-подключению используется для локального теста.

## 5. Загрузить и опубликовать в каталоге OpenAI

Открой [OpenAI Platform → Plugins](https://platform.openai.com/plugins).
Выбери организацию и проект владельца, заверши верификацию издателя.
Для не-владельца организации нужна роль с Apps Management Write.

Нажми **Upload new or existing plugin**, выбери verified Developer identity
и загрузи ZIP. Исправляй замечания в исходном пакете и загружай новую ZIP-версию.

В **MCPs → Levelry → Connect** проверь URL и OAuth. Когда портал выдаст
challenge, скопируй точный токен в переменную `OPENAI_APPS_CHALLENGE`
на DigitalOcean и дождись выкладки. Сервер отдаёт его по адресу:

```text
https://levelry-server-hvyc5.ondigitalocean.app/.well-known/openai-apps-challenge
```

Вернись в портал и выполни проверку домена, OAuth и скан инструментов.
В **Metadata & Skills → Review information → Review details** введи
приватные данные тестового аккаунта и проверь импортированные сценарии
и видео. Пройди живые тесты, исправь обязательные findings, затем выбери
**Submit for review**. После одобрения нажми **Publish plugin**.
[Официальная инструкция загрузки и ревью](https://developers.openai.com/plugins/deploy/submission).

Публичная отправка сейчас не выполнена: нужны твои настройки DigitalOcean,
регистрация в ChatGPT, подтверждённый издатель, policy/support URL,
reviewer-аккаунт, видео и живые проверки. Код и черновой пакет готовы
для этих шагов.

Откат интеграции: `CHATGPT_ENABLED=false` и новый деплой сервера.
Миграцию базы откатывать не требуется.
