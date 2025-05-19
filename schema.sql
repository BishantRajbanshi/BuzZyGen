CREATE DATABASE `news_portal`;
USE news_portal;

CREATE TABLE `news` (                                                               
  `id` int NOT NULL AUTO_INCREMENT,                                                           
  `title` varchar(255) NOT NULL,                                                              
  `subtitle` varchar(255) DEFAULT NULL,                                                       
  `content` text,                                                                             
  `featured_image` longtext,                                                                  
  `category` varchar(50) DEFAULT NULL,                                                        
  `tags` varchar(255) DEFAULT NULL,                                                           
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,                                      
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,          
  PRIMARY KEY (`id`)                                                                          
);       

CREATE TABLE `password_reset_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_email` (`email`),
  KEY `idx_otp` (`otp`),
  CONSTRAINT `password_reset_otps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

 CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `google_id` varchar(255) DEFAULT NULL,
  `profile_picture` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_google_id` (`google_id`)
);


CREATE TABLE `blogs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` text,
  `content` text NOT NULL,
  `featured_image` longtext,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approved` tinyint(1) DEFAULT '0',
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  article_id INT NOT NULL,
  UNIQUE KEY unique_user_article (user_id, article_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (article_id) REFERENCES news(id)
);


-- Create admin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@newsportal.com', '$2a$10$ZVtYxCsmmFk0WGWJlZJP7ec6EUtNIGaPW4WiqsFH4rksy2qQMaKhO', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';

