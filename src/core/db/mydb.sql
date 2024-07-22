CREATE DATABASE intern_chat;
USE intern_chat;

CREATE TABLE permissions (
    id_permission INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status_permission BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    network_user VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    dominio VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    status_user BOOLEAN NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id_role)
);

CREATE TABLE role_permissions (
    permission_id INT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (permission_id) REFERENCES Permissions(id_permission),
    FOREIGN KEY (role_id) REFERENCES roles(id_role)
);

CREATE TABLE channels (
    channel_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    status_channel BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    channel_id INT NOT NULL,
    content TEXT NOT NULL,
    url_file VARCHAR(255) NOT NULL,
    type_message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id_user),
    FOREIGN KEY (channel_id) REFERENCES channels(channel_id)
);

CREATE TABLE history_maintenances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    date_maintenance DATE NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);

CREATE TABLE direct_message (
    direct_message_id INT AUTO_INCREMENT PRIMARY KEY,
    send_id INT NOT NULL,
    recipient_id INT NOT NULL,
    content TEXT NOT NULL,
    url_file VARCHAR(255) NOT NULL,
    message_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (send_id) REFERENCES users(id_user),
    FOREIGN KEY (recipient_id) REFERENCES users(id_user)
);

CREATE TABLE users_channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    channel_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id_user),
    FOREIGN KEY (channel_id) REFERENCES channels(channel_id)
);


-- Insertar permisos
INSERT INTO permissions (name, status_permission) VALUES 
('Permiso_1', 1),
('Permiso_2', 1),
('Permiso_3', 1);

-- Insertar roles
INSERT INTO roles (name) VALUES 
('ADMIN'),
('USER'),
('SUPER_ADMIN');

-- Insertar usuarios
INSERT INTO users (network_user, full_name, photo_url, dominio, password, role_id, status_user) VALUES 
('usuario1', 'Usuario Uno', 'url_foto1', 'dominio1', 'contraseña1', 1, 1),
('usuario2', 'Usuario Dos', 'url_foto2', 'dominio2', 'contraseña2', 2, 1),
('usuario3', 'Usuario Tres', 'url_foto3', 'dominio3', 'contraseña3', 3, 1);

-- Insertar relaciones de roles y permisos
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(1, 1),
(1, 2),
(2, 3),
(3, 1),
(3, 2),
(3, 3);

-- Insertar canales
INSERT INTO channels (name, description, status_channel) VALUES 
('Canal_1', 'Descripción del Canal 1', 1),
('Canal_2', 'Descripción del Canal 2', 1),
('Canal_3', 'Descripción del Canal 3', 1);

-- Insertar mensajes
INSERT INTO messages (user_id, channel_id, content, url_file, type_message) VALUES 
(1, 1, 'Contenido del mensaje 1', 'url_archivo1', 'tipo1'),
(2, 2, 'Contenido del mensaje 2', 'url_archivo2', 'tipo2'),
(3, 3, 'Contenido del mensaje 3', 'url_archivo3', 'tipo3');

-- Insertar mantenimientos
INSERT INTO history_maintenances (id_user, date_maintenance, description) VALUES 
(1, '2024-06-13', 'Descripción de mantenimiento 1'),
(2, '2024-06-14', 'Descripción de mantenimiento 2'),
(3, '2024-06-15', 'Descripción de mantenimiento 3');

-- Insertar mensajes directos
INSERT INTO DirectMessage (send_id, recipient_id, content, url_file, message_type) VALUES 
(1, 2, 'Contenido del mensaje directo 1', 'url_archivo_directo1', 'tipo_directo1'),
(2, 3, 'Contenido del mensaje directo 2', 'url_archivo_directo2', 'tipo_directo2'),
(3, 1, 'Contenido del mensaje directo 3', 'url_archivo_directo3', 'tipo_directo3');

-- Insertar usuarios en canales
INSERT INTO users_channels (user_id, channel_id) VALUES 
(1, 1),
(2, 2),
(3, 3);
