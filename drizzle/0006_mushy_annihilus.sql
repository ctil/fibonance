CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`birthday` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
INSERT INTO `user` ("id", "name", "email", "email_verified", "image", "created_at", "updated_at", "birthday") SELECT "id", "username", "username" || '@invalid.local', 1, NULL, unixepoch(), unixepoch(), "birthday" FROM `users`;--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `__new_portfolios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT 'datetime(''now'')',
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_portfolios`("id", "user_id", "name", "description", "created_at") SELECT "id", "user_id", "name", "description", "created_at" FROM `portfolios`;--> statement-breakpoint
DROP TABLE `portfolios`;--> statement-breakpoint
ALTER TABLE `__new_portfolios` RENAME TO `portfolios`;--> statement-breakpoint
CREATE UNIQUE INDEX `portfolios_user_name_idx` ON `portfolios` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `__new_retirement_scenarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text DEFAULT 'Default' NOT NULL,
	`current_value` integer,
	`annual_savings` integer,
	`annual_expenses` integer,
	`safe_withdrawal_rate` integer,
	`expected_real_return` integer,
	`year_adjustment` integer DEFAULT 5,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_retirement_scenarios`("id", "user_id", "name", "current_value", "annual_savings", "annual_expenses", "safe_withdrawal_rate", "expected_real_return", "year_adjustment") SELECT "id", "user_id", "name", "current_value", "annual_savings", "annual_expenses", "safe_withdrawal_rate", "expected_real_return", "year_adjustment" FROM `retirement_scenarios`;--> statement-breakpoint
DROP TABLE `retirement_scenarios`;--> statement-breakpoint
ALTER TABLE `__new_retirement_scenarios` RENAME TO `retirement_scenarios`;--> statement-breakpoint
CREATE TABLE `__new_tax_documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`institution` text NOT NULL,
	`doc_type` text NOT NULL,
	`tax_year` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`portal_url` text,
	`notes` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tax_documents`("id", "user_id", "institution", "doc_type", "tax_year", "status", "portal_url", "notes", "updated_at") SELECT "id", "user_id", "institution", "doc_type", "tax_year", "status", "portal_url", "notes", "updated_at" FROM `tax_documents`;--> statement-breakpoint
DROP TABLE `tax_documents`;--> statement-breakpoint
ALTER TABLE `__new_tax_documents` RENAME TO `tax_documents`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
DROP TABLE `users`;
