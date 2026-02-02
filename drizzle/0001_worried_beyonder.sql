CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
DROP INDEX `portfolios_name_unique`;--> statement-breakpoint
ALTER TABLE `portfolios` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
CREATE UNIQUE INDEX `portfolios_user_name_idx` ON `portfolios` (`user_id`,`name`);
