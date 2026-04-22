-- Add version tracking to ships
ALTER TABLE ships ADD COLUMN last_received_version INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
-- Add version columns to sync_receipts
ALTER TABLE sync_receipts ADD COLUMN from_version INTEGER;
--> statement-breakpoint
ALTER TABLE sync_receipts ADD COLUMN to_version INTEGER;
--> statement-breakpoint
-- Add date index + soft-delete to noon_positions
ALTER TABLE noon_positions ADD COLUMN date TEXT;
--> statement-breakpoint
ALTER TABLE noon_positions ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
-- Indexes
CREATE INDEX IF NOT EXISTS idx_noon_positions_ship ON noon_positions(ship_id, deleted, date DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_sync_receipts_ship  ON sync_receipts(ship_id, received_at DESC);
