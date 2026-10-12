-- Bookshelf.cv accounts and shelves. Safe to run repeatedly (npm run db:setup).

CREATE TABLE IF NOT EXISTS users (
  id              CHAR(36)     NOT NULL PRIMARY KEY,
  email           VARCHAR(254) NOT NULL UNIQUE,
  name            VARCHAR(120) NOT NULL,
  picture         VARCHAR(500) NULL,
  password_hash   VARCHAR(200) NULL,          -- NULL for Google-only accounts
  google_sub      VARCHAR(64)  NULL UNIQUE,   -- Google's stable account id
  username        VARCHAR(30)  NULL UNIQUE,   -- bookshelf.cv/<username>, claimed after sign-up
  session_version INT          NOT NULL DEFAULT 0, -- bumped on password reset to sign out other devices
  failed_logins   INT          NOT NULL DEFAULT 0,
  locked_until    DATETIME     NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shelves (
  user_id             CHAR(36)    NOT NULL PRIMARY KEY,
  theme_id            VARCHAR(40) NOT NULL DEFAULT 'light-grid',
  purchased_theme_ids JSON        NOT NULL,
  books               JSON        NOT NULL,
  updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT shelves_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  token_hash CHAR(64) NOT NULL PRIMARY KEY,   -- sha256 of the emailed token; the token itself is never stored
  user_id    CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at    DATETIME NULL,
  CONSTRAINT password_resets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
