# ClinoSift - Base de datos MySQL

Script relacional completo para el sistema de gestión clínica ClinoSift.

## Contenido
```
clinosift-mysql/
├── clinosift.sql     # Script completo: DB, tablas, datos, consultas
└── README.md
```

## Cómo ejecutarlo en MySQL Workbench
1. Abre MySQL Workbench y conéctate a tu servidor.
2. Abre `clinosift.sql` (File → Open SQL Script).
3. Ejecuta todo el script (rayo amarillo "Execute" o `Ctrl+Shift+Enter`).
4. El script crea la base `clinosift`, las 4 tablas, inserta los datos y
   ejecuta automáticamente los `SELECT` de verificación (los resultados
   aparecerán en pestañas en la parte inferior de Workbench).

También puedes ejecutarlo por línea de comandos:
```bash
mysql -u root -p < clinosift.sql
```

## Diseño de las tablas

| Tabla | Llave primaria | Relaciones |
|---|---|---|
| `pacientes` | `id_paciente` | — |
| `medicos` | `id_medico` | — |
| `usuarios` | `id_usuario` | `id_paciente` → `pacientes`, `id_medico` → `medicos` (opcionales, según el rol) |
| `citas` | `id_cita` | `id_paciente` → `pacientes`, `id_medico` → `medicos` (obligatorias) |

**Reglas de integridad aplicadas:**
- `documento` es `UNIQUE` en `pacientes` y `medicos` (no se puede duplicar una cédula).
- `correo` es `UNIQUE` en `usuarios`.
- `citas` tiene una restricción `UNIQUE (id_medico, fecha, hora)` para que un
  médico no pueda tener dos citas en el mismo horario.
- Si se elimina un paciente o un médico, sus citas se eliminan en cascada
  (`ON DELETE CASCADE`).
- Si se elimina un paciente o médico que tenía una cuenta de `usuario`
  asociada, el usuario **no** se borra: su referencia queda en `NULL`
  (`ON DELETE SET NULL`), para no perder el historial de acceso.

## Datos de prueba incluidos
- **Pacientes:** los 4 reales de ClinoSift (Juan Carlos Arteaga Mejia, Blanca
  Elena Bastidas Yaguapaz, Segundo Nicolas Rosero Hernandez, Flor Alba
  Hernandez Chamorro) + 1 adicional para completar el mínimo de 5 pedido.
- **Médicos:** los 2 reales (Oscar Cabrera Pino, Yesenia Yamiled Goyes Usama)
  + 3 adicionales para completar el mínimo de 5.
- **Usuarios y citas:** 5 registros cada uno, enlazados de forma coherente
  con los pacientes y médicos anteriores.

## Consultas incluidas en el script
- `SELECT *` de las 4 tablas.
- `SELECT ... WHERE` (pacientes nacidos después de 1990, médicos por
  especialidad, citas pendientes).
- `SELECT ... JOIN` obligatorio: citas combinadas con el nombre del paciente
  y del médico, más una variante filtrando solo citas confirmadas.

## Verificación realizada
Antes de entregarte esto, ejecuté el script completo contra un servidor
MySQL/MariaDB real (no solo revisión de sintaxis) y confirmé:
- Las 4 tablas y los 5 registros por tabla se crean sin errores.
- Los `JOIN` devuelven correctamente paciente + médico + datos de la cita.
- La llave foránea rechaza un `id_medico` que no existe (error 1452).
- La restricción `UNIQUE` de horario rechaza una cita duplicada para el
  mismo médico en la misma fecha/hora (error 1062).
- El `ON DELETE CASCADE` elimina automáticamente las citas de un paciente
  al borrarlo.
