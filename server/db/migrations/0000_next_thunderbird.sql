CREATE TABLE `machinery_latest` (
	`ship_id` text PRIMARY KEY NOT NULL,
	`snapshot_at` text,
	`data` text NOT NULL,
	FOREIGN KEY (`ship_id`) REFERENCES `ships`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `mooring_latest` (
	`ship_id` text PRIMARY KEY NOT NULL,
	`snapshot_at` text,
	`items` text NOT NULL,
	`lines` text NOT NULL,
	FOREIGN KEY (`ship_id`) REFERENCES `ships`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `mooring_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ship_id` text,
	`snapshot_at` text,
	`items` text NOT NULL,
	`lines` text NOT NULL,
	FOREIGN KEY (`ship_id`) REFERENCES `ships`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `noon_positions` (
	`id` text NOT NULL,
	`ship_id` text NOT NULL,
	`received_at` text,
	`data` text NOT NULL,
	PRIMARY KEY(`ship_id`, `id`),
	FOREIGN KEY (`ship_id`) REFERENCES `ships`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `noon_templates` (
	`ship_id` text PRIMARY KEY NOT NULL,
	`fields` text NOT NULL,
	FOREIGN KEY (`ship_id`) REFERENCES `ships`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `office_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `office_users_email_unique` ON `office_users` (`email`);--> statement-breakpoint
CREATE TABLE `rotation_latest` (
	`ship_id` text PRIMARY KEY NOT NULL,
	`snapshot_at` text,
	`data` text NOT NULL,
	FOREIGN KEY (`ship_id`) REFERENCES `ships`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rotation_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ship_id` text,
	`snapshot_at` text,
	`data` text NOT NULL,
	FOREIGN KEY (`ship_id`) REFERENCES `ships`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ships` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`imo_number` text,
	`flag` text,
	`vessel_type` text,
	`sync_token` text NOT NULL,
	`last_sync_at` text,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ships_sync_token_unique` ON `ships` (`sync_token`);--> statement-breakpoint
CREATE TABLE `sync_receipts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ship_id` text,
	`received_at` text,
	`payload_size_kb` integer,
	`success` integer NOT NULL,
	`error_msg` text,
	FOREIGN KEY (`ship_id`) REFERENCES `ships`(`id`) ON UPDATE no action ON DELETE no action
);
