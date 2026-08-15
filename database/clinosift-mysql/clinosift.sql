DROP DATABASE IF EXISTS clinosift;
CREATE DATABASE clinosift
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE clinosift;

CREATE TABLE usuarios (
  id_usuario   INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(120) NOT NULL,
  correo       VARCHAR(120) NOT NULL UNIQUE,
  contrasena   VARCHAR(255) NOT NULL,
  rol          ENUM('admin', 'medico', 'paciente') NOT NULL,
  activo       TINYINT(1) NOT NULL DEFAULT 1,
  creado_en    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE pacientes (
  id_paciente       INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario        INT NOT NULL UNIQUE,
  documento         VARCHAR(20) NOT NULL UNIQUE,
  fecha_nacimiento  DATE,
  telefono          VARCHAR(20),
  direccion         VARCHAR(150),
  CONSTRAINT fk_pacientes_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE medicos (
  id_medico        INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario       INT NOT NULL UNIQUE,
  registro_medico  VARCHAR(30) NOT NULL UNIQUE,
  especialidad     VARCHAR(100) NOT NULL,
  telefono         VARCHAR(20),
  CONSTRAINT fk_medicos_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE citas (
  id_cita      INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente  INT NOT NULL,
  id_medico    INT NOT NULL,
  fecha        DATE NOT NULL,
  hora         TIME NOT NULL,
  motivo       VARCHAR(200) NOT NULL,
  estado       ENUM('pendiente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendiente',
  creado_en    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_citas_paciente
    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_citas_medico
    FOREIGN KEY (id_medico) REFERENCES medicos(id_medico)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT uq_citas_medico_horario UNIQUE (id_medico, fecha, hora)
) ENGINE=InnoDB;

CREATE INDEX idx_citas_fecha ON citas(fecha);
CREATE INDEX idx_citas_estado ON citas(estado);

INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
('Administrador ClinoSift', 'admin@clinosift.com', 'Admin123!', 'admin'),
('Oscar Cabrera Pino', 'oscar.cabrera@clinosift.com', '104756007', 'medico'),
('Yesenia Yamiled Goyes Usama', 'yesenia.goyes@clinosift.com', '1074002473', 'medico'),
('Ricardo Andres Portilla Benavides', 'ricardo.portilla@clinosift.com', '1074119832', 'medico'),
('Juan Carlos Arteaga Mejia', 'juan.arteaga@correo.com', '1007120003', 'paciente'),
('Blanca Elena Bastidas Yaguapaz', 'blanca.bastidas@correo.com', '1085909924', 'paciente'),
('Segundo Nicolas Rosero Hernandez', 'segundo.rosero@correo.com', '1197841209', 'paciente'),
('Flor Alba Hernandez Chamorro', 'flor.hernandez@correo.com', '37007378', 'paciente'),
('Maria Fernanda Rosero Cuastumal', 'maria.rosero@correo.com', '1088765432', 'paciente');

INSERT INTO pacientes (id_usuario, documento, fecha_nacimiento, telefono, direccion) VALUES
(5, '1007120003', '1991-03-14', '3001112233', 'Calle 10 #5-20'),
(6, '1085909924', '1984-07-22', '3002223344', 'Carrera 8 #12-33'),
(7, '1197841209', '1978-11-05', '3003334455', 'Avenida 5 #20-10'),
(8, '37007378',   '1969-01-30', '3004445566', 'Cra 3 #8-14'),
(9, '1088765432', '1995-05-18', '3007778899', 'Calle 18 #9-40');

INSERT INTO medicos (id_usuario, registro_medico, especialidad, telefono) VALUES
(2, 'RM-104756007', 'Medicina general', '3105556677'),
(3, 'RM-1074002473', 'Pediatria', '3106667788'),
(4, 'RM-1074119832', 'Cardiologia', '3117778899');

INSERT INTO citas (id_paciente, id_medico, fecha, hora, motivo, estado) VALUES
(1, 1, '2026-08-05', '09:30:00', 'Consulta general', 'confirmada'),
(2, 2, '2026-08-06', '11:00:00', 'Control pediatrico', 'pendiente'),
(3, 3, '2026-08-07', '15:00:00', 'Chequeo cardiovascular', 'pendiente'),
(4, 1, '2026-08-08', '10:15:00', 'Consulta general', 'confirmada'),
(5, 2, '2026-08-10', '14:30:00', 'Control pediatrico', 'cancelada');

SELECT * FROM usuarios;
SELECT * FROM pacientes;
SELECT * FROM medicos;
SELECT * FROM citas;

SELECT nombre, correo, rol
FROM usuarios
WHERE rol = 'medico';

SELECT p.documento, p.telefono
FROM pacientes p
WHERE p.fecha_nacimiento > '1990-01-01';

SELECT id_cita, fecha, hora, motivo
FROM citas
WHERE estado = 'pendiente';

SELECT
  c.id_cita,
  c.fecha,
  c.hora,
  c.motivo,
  c.estado,
  up.nombre AS paciente,
  um.nombre AS medico,
  m.especialidad
FROM citas c
INNER JOIN pacientes p ON p.id_paciente = c.id_paciente
INNER JOIN usuarios up ON up.id_usuario = p.id_usuario
INNER JOIN medicos m ON m.id_medico = c.id_medico
INNER JOIN usuarios um ON um.id_usuario = m.id_usuario
ORDER BY c.fecha, c.hora;
