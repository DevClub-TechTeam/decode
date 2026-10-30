CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    account_type TINYINT UNSIGNED NOT NULL,
    username VARCHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_id_account_type (id, account_type),
    KEY idx_users_account_status (account_status),
    
    CONSTRAINT chk_users_account_type
        CHECK (account_type IN (1, 2))
) ENGINE=InnoDB
  DEFAULT CHARACTER SET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
CREATE TABLE players (
     user_id BIGINT UNSIGNED NOT NULL,
     account_type TINYINT UNSIGNED NOT NULL DEFAULT 1,

     PRIMARY KEY (user_id),

     CONSTRAINT chk_players_account_type
         CHECK (account_type = 1),
     CONSTRAINT fk_players_user
         FOREIGN KEY (user_id, account_type)
             REFERENCES users(id, account_type)
             ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
CREATE TABLE admins (
    user_id BIGINT UNSIGNED NOT NULL,
    account_type TINYINT UNSIGNED NOT NULL DEFAULT 2,
    is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (user_id),

    CONSTRAINT chk_admins_account_type
        CHECK (account_type = 2),
    CONSTRAINT fk_admins_user
        FOREIGN KEY (user_id, account_type)
            REFERENCES users(id, account_type)
            ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
CREATE TABLE teams (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    UNIQUE KEY uq_teams_name (name)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
CREATE TABLE team_players (
    player_id BIGINT UNSIGNED NOT NULL,
    team_id BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (player_id),
    KEY idx_team_players_team_id (team_id),
    
    CONSTRAINT fk_team_players_player
        FOREIGN KEY (player_id)
            REFERENCES players(user_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_team_players_team
        FOREIGN KEY (team_id)
            REFERENCES teams(id)
            ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;