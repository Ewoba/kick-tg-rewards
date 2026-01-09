# 🔧 SQL для миграции (если prisma migrate не работает)

Если `prisma migrate dev` не работает в non-interactive режиме, выполните SQL вручную:

## SQL для применения

```sql
-- 1. Создать таблицу OAuthState
CREATE TABLE IF NOT EXISTS "OAuthState" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("id")
);

-- 2. Добавить уникальный индекс на state
CREATE UNIQUE INDEX IF NOT EXISTS "OAuthState_state_key" ON "OAuthState"("state");

-- 3. Добавить индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS "OAuthState_state_idx" ON "OAuthState"("state");
CREATE INDEX IF NOT EXISTS "OAuthState_used_expiresAt_idx" ON "OAuthState"("used", "expiresAt");

-- 4. Добавить поле nonceUsed в WalletVerification
ALTER TABLE "WalletVerification" ADD COLUMN IF NOT EXISTS "nonceUsed" BOOLEAN NOT NULL DEFAULT false;

-- 5. Добавить уникальный индекс на nonce (если его еще нет)
CREATE UNIQUE INDEX IF NOT EXISTS "WalletVerification_nonce_key" ON "WalletVerification"("nonce");

-- 6. Обновить существующие записи (если есть)
UPDATE "WalletVerification" SET "nonceUsed" = false WHERE "nonceUsed" IS NULL;
```

## Выполнение через psql

```powershell
# Подключиться к БД
docker exec -i drops-crypto-api-postgres-1 psql -U drops -d drops

# Или через Prisma Studio
cd drops-crypto-api
npx prisma studio
# Затем выполните SQL в разделе "Raw SQL"
```

## Альтернатива: prisma db push

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npx prisma db push
```

Это синхронизирует схему без создания миграции (только для dev).

---

**После применения SQL сгенерируйте Prisma Client:**
```powershell
npx prisma generate
```
