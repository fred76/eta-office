CREATE TABLE IF NOT EXISTS `sailing_direction_latest` (
  `ship_id`     TEXT NOT NULL PRIMARY KEY REFERENCES `ships`(`id`),
  `snapshot_at` TEXT,
  `data`        TEXT NOT NULL
);