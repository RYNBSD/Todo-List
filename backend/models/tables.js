const USERS = `CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  image longblob NOT NULL,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()
)`;

const TODOS = `CREATE TABLE IF NOT EXISTS todos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(2000) NOT NULL,
  image longblob NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  user_id INT NOT NULL,
  expired_at INT NOT NULL,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),

  FOREIGN KEY (user_id) REFERENCES users (id)
)`;

module.exports = {
  USERS,
  TODOS,
}