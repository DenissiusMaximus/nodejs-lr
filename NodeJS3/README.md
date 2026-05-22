# Лабораторна робота №7: автентифікація та авторизація

Цей файл підсумовує, де саме в коді реалізовані ключові частини лабораторної, і дає прямі посилання на відповідні рядки.

## Модель користувача

Модель користувача описана в [src/models/user.model.ts](src/models/user.model.ts#L8). Тут є поля `email` і `passwordHash`, унікальний індекс на пошту, а також налаштування `toJSON`, яке прибирає хеш пароля з відповіді. Сам хеш створюється у `pre save` hook на [src/models/user.model.ts](src/models/user.model.ts#L41).

## Реєстрація користувача

Ендпоінт `POST /auth/register` знаходиться в [src/routes/auth.routes.ts](src/routes/auth.routes.ts#L11). Він спочатку проходить валідацію через Zod-схему, потім створює користувача через `UserModel`, а у разі дубліката email повертає `409 Conflict`.

Сама схема валідації оголошена в [src/schemas/auth.schema.ts](src/schemas/auth.schema.ts#L3): email перевіряється на коректний формат, а пароль має мінімальну довжину 6 символів.

## Хешування пароля у pre save hook

Хешування виконується в [src/models/user.model.ts](src/models/user.model.ts#L41). Це означає, що пароль перетворюється на bcrypt-хеш безпосередньо перед збереженням документа в базу.

Такий підхід потрібен, щоб:

1. Не зберігати пароль у відкритому вигляді.
2. Автоматично отримувати новий хеш лише тоді, коли поле пароля було змінене.
3. Тримати логіку захисту пароля в моделі, а не розмазувати її по роутам.

Hook працює так: спочатку перевіряє `isModified('passwordHash')`, і якщо поле не змінювалось, нічого не робить. Якщо пароль новий або оновлений, він хешується через `bcrypt.hash(...)`.

## JWT генерація

Генерація access і refresh токенів реалізована в [src/utils/auth.ts](src/utils/auth.ts#L36). Тут формується payload з `userId` і типом токена, а секрет береться з `JWT_SECRET` у [src/utils/auth.ts](src/utils/auth.ts#L23).

Налаштування cookie для токенів також знаходяться тут: [src/utils/auth.ts](src/utils/auth.ts#L10) і [src/utils/auth.ts](src/utils/auth.ts#L61). Саме звідси токени записуються в `httpOnly` cookies з прапорцями `secure` та `sameSite=strict`.

## Захист маршрутів

Middleware автентифікації знаходиться в [src/middleware/requireAuth.ts](src/middleware/requireAuth.ts#L4). Він читає `access_token` з cookie, перевіряє JWT через `verifyAccessToken`, а потім додає `req.userId` до запиту.

Розширення типу `Request`, щоб `req.userId` був доступний у TypeScript, описане в [src/types/express/index.d.ts](src/types/express/index.d.ts#L5).

У ресурсі категорій захищені саме змінюючі стан маршрути: `POST`, `PUT`, `PATCH` і `DELETE`. Це видно в [src/routes/category.routes.ts](src/routes/category.routes.ts#L59), [src/routes/category.routes.ts](src/routes/category.routes.ts#L84) і [src/routes/category.routes.ts](src/routes/category.routes.ts#L87). Публічними залишаються `GET`-маршрути.

Перевірка власника виконується перед `PUT`/`DELETE` у [src/routes/category.routes.ts](src/routes/category.routes.ts#L74) і [src/routes/category.routes.ts](src/routes/category.routes.ts#L95): якщо `ownerId` запису не збігається з `req.userId`, API повертає `403 Forbidden`.

При створенні категорії власник передається з `req.userId`, тому новий запис одразу прив’язується до користувача, який авторизувався.