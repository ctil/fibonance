CREATE TABLE `portfolios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT 'datetime(''now'')'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portfolios_name_unique` ON `portfolios` (`name`);--> statement-breakpoint
CREATE TABLE `stock_allocations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`portfolio_id` integer NOT NULL,
	`symbol` text NOT NULL,
	`target_percentage` integer NOT NULL,
	`description` text NOT NULL,
	`alternatives` text,
	`sort_order` integer DEFAULT 0,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON UPDATE no action ON DELETE cascade
);
