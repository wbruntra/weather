CREATE TABLE `users` (
  `id` integer not null primary key autoincrement,
  `name` varchar(255) not null,
  `email` varchar(255) not null,
  `password_hash` varchar(255) not null,
  `created_at` datetime default CURRENT_TIMESTAMP,
  `updated_at` datetime default CURRENT_TIMESTAMP
)