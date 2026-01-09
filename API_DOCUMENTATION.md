# 📚 API Документация

## Базовый URL

- Локально: `http://localhost:3000`
- Через ngrok: `https://ваш-ngrok-url.ngrok-free.app`

## Аутентификация

Большинство endpoints требуют JWT токен в заголовке:
```
Authorization: Bearer <your_jwt_token>
```

Токен получается через OAuth флоу: `/auth/twitch/start` → `/auth/twitch/callback`

---

## Публичные Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "ok": true
}
```

### Список стримеров
```
GET /streamers
```

**Response:**
```json
[
  {
    "id": "uuid",
    "twitchId": "123456",
    "twitchLogin": "streamer1",
    "displayName": "Streamer One",
    "avatarUrl": "https://...",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "_count": {
      "prizes": 5
    }
  }
]
```

### Детали стримера
```
GET /streamers/:id
```

**Response:**
```json
{
  "id": "uuid",
  "twitchId": "123456",
  "twitchLogin": "streamer1",
  "displayName": "Streamer One",
  "avatarUrl": "https://...",
  "isActive": true,
  "prizes": [
    {
      "id": "uuid",
      "title": "100 USDC",
      "description": "...",
      "tokenAmount": "100",
      "tokenSymbol": "USDC",
      "chain": "base",
      "isActive": true
    }
  ]
}
```

### Список призов
```
GET /prizes
```

**Response:**
```json
[
  {
    "id": "uuid",
    "streamerId": "uuid",
    "title": "100 USDC",
    "description": "За просмотр стрима",
    "imageUrl": "https://...",
    "tokenAmount": "100",
    "tokenSymbol": "USDC",
    "chain": "base",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "streamer": {
      "displayName": "Streamer One",
      "twitchLogin": "streamer1"
    }
  }
]
```

### Детали приза
```
GET /prizes/:id
```

**Response:** Аналогично элементу из списка призов

---

## OAuth Endpoints

### Начало OAuth
```
GET /auth/twitch/start
```

Редиректит на Twitch OAuth страницу.

### OAuth Callback
```
GET /auth/twitch/callback?code=...
```

Обрабатывает callback от Twitch и редиректит в приложение с токеном:
```
dropscrypto://auth?token=<jwt_token>
```

---

## Авторизованные Endpoints (требуют JWT)

### Данные пользователя
```
GET /me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "twitchLogin": "user123",
  "wallet": {
    "chain": "base",
    "address": "0x..."
  },
  "participationActive": true
}
```

### Добавить/обновить кошелёк
```
POST /me/wallet
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "0x1234567890123456789012345678901234567890"
}
```

**Response:**
```json
{
  "ok": true
}
```

### Мои отслеживаемые стримеры
```
GET /me/streamers
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "streamer": {
      "id": "uuid",
      "twitchLogin": "streamer1",
      "displayName": "Streamer One",
      "avatarUrl": "https://...",
      "isActive": true,
      "_count": {
        "prizes": 5
      }
    },
    "followedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Подписаться на стримера
```
POST /me/streamers/:streamerId/follow
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "follow": {
    "id": "uuid",
    "userId": "uuid",
    "streamerId": "uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "streamer": { ... }
  },
  "message": "Streamer followed successfully"
}
```

### Отписаться от стримера
```
DELETE /me/streamers/:streamerId/follow
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Unfollowed successfully"
}
```

### Мои призы
```
GET /prizes/my/claims
Authorization: Bearer <token>
```

**Query параметры:**
- `status` (опционально): `PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`

**Пример:**
```
GET /prizes/my/claims?status=PENDING
```

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "prizeId": "uuid",
    "status": "PENDING",
    "claimedAt": "2024-01-01T00:00:00Z",
    "processedAt": null,
    "completedAt": null,
    "txHash": null,
    "txError": null,
    "retryCount": 0,
    "prize": {
      "id": "uuid",
      "title": "100 USDC",
      "description": "...",
      "tokenAmount": "100",
      "tokenSymbol": "USDC",
      "chain": "base",
      "streamer": {
        "displayName": "Streamer One",
        "twitchLogin": "streamer1"
      }
    }
  }
]
```

### Получить приз
```
POST /prizes/:id/claim
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "claim": {
    "id": "uuid",
    "status": "PENDING",
    "claimedAt": "2024-01-01T00:00:00Z",
    "prize": { ... }
  },
  "message": "Prize claimed successfully. Processing will start shortly."
}
```

---

## Админ Endpoints (требуют JWT)

### Создать стримера
```
POST /admin/streamers
Authorization: Bearer <token>
Content-Type: application/json

{
  "twitchId": "123456",
  "twitchLogin": "streamer1",
  "displayName": "Streamer One",
  "avatarUrl": "https://..." (опционально)
}
```

**Response:**
```json
{
  "success": true,
  "streamer": {
    "id": "uuid",
    "twitchId": "123456",
    "twitchLogin": "streamer1",
    "displayName": "Streamer One",
    "avatarUrl": "https://...",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Создать приз
```
POST /admin/streamers/:streamerId/prizes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "100 USDC",
  "description": "За просмотр стрима" (опционально),
  "imageUrl": "https://..." (опционально),
  "tokenAmount": "100" (опционально),
  "tokenSymbol": "USDC" (опционально, по умолчанию "USDC"),
  "chain": "base" (опционально, по умолчанию "base")
}
```

**Response:**
```json
{
  "success": true,
  "prize": {
    "id": "uuid",
    "streamerId": "uuid",
    "title": "100 USDC",
    "description": "...",
    "tokenAmount": "100",
    "tokenSymbol": "USDC",
    "chain": "base",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "streamer": {
      "displayName": "Streamer One",
      "twitchLogin": "streamer1"
    }
  }
}
```

### Активировать приз
```
PUT /admin/prizes/:prizeId/activate
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "prize": { ... }
}
```

### Деактивировать приз
```
PUT /admin/prizes/:prizeId/deactivate
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "prize": { ... }
}
```

---

## Коды ошибок

- `400 Bad Request` - неверные данные
- `401 Unauthorized` - отсутствует или неверный токен
- `404 Not Found` - ресурс не найден
- `409 Conflict` - конфликт (например, уже подписан)
- `500 Internal Server Error` - ошибка сервера

---

## Примеры использования

### Полный флоу пользователя:

1. Авторизация:
   ```
   GET /auth/twitch/start
   → Редирект на Twitch
   → Twitch callback → dropscrypto://auth?token=...
   ```

2. Получить данные:
   ```
   GET /me
   Authorization: Bearer <token>
   ```

3. Добавить кошелёк:
   ```
   POST /me/wallet
   Authorization: Bearer <token>
   { "address": "0x..." }
   ```

4. Подписаться на стримера:
   ```
   POST /me/streamers/{streamerId}/follow
   Authorization: Bearer <token>
   ```

5. Получить приз:
   ```
   POST /prizes/{prizeId}/claim
   Authorization: Bearer <token>
   ```

6. Посмотреть свои призы:
   ```
   GET /prizes/my/claims
   Authorization: Bearer <token>
   ```

---

**Готово! Все endpoints задокументированы.** 📚
