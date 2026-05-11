DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccountRole') THEN
    CREATE TYPE "AccountRole" AS ENUM ('USER', 'ADMIN');
  END IF;
END
$$;

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "role" "AccountRole" NOT NULL DEFAULT 'USER';

ALTER TABLE "User"
ALTER COLUMN "password" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
