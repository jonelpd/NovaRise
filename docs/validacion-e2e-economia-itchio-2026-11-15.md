# Validación E2E — economía, reclutamiento, guardado y paridad itch.io
Fecha de preparación: 2026-11-15. Estado: **PENDIENTE DE EJECUCIÓN EN NAVEGADOR**.

Este protocolo complementa el [plan maestro](plan-maestro-reinos-de-leyenda.md). Las pruebas Node/CI no acreditan por sí mismas los resultados interactivos. Usar exclusivamente campañas y cuentas de prueba, exportando un respaldo antes de ensayar recuperación. No publicar una versión externa de itch.io hasta superar los casos aplicables.

## Datos de ejecución
- Commit probado:
- URL/edición (NovaRise o paquete itch.io):
- Navegador, versión, sistema operativo y dispositivo:
- Fecha/hora:
- Partida de prueba / respaldo:
- Evidencia (captura, vídeo o registro):
- Incidencias y severidad:

## Casos de aceptación
| ID | Procedimiento | Resultado exigido | Estado |
| --- | --- | --- | --- |
| E2E-ECO-01 | Iniciar campaña nueva; conquistar una mina; registrar recursos; terminar un turno; repetir sin conquistar otra mina. | Solo las minas controladas producen; producción esperada por mina conforme a las reglas vigentes (10 cristales por turno en el plan actual), sin cobros duplicados. | PENDIENTE |
| E2E-ECO-02 | Conquistar dos minas; guardar; cerrar la pestaña; volver a abrir y avanzar un turno. | Control y producción de ambas minas persisten; no se generan ingresos por la recarga. | PENDIENTE |
| E2E-REC-01 | Visitar un edificio morado; anotar tropas; intentar reclutar de nuevo en la misma semana. | Una sola concesión semanal; segundo intento sin soldados adicionales. | PENDIENTE |
| E2E-REC-02 | Guardar tras reclutar; cerrar y reabrir; volver al edificio en la misma semana; avanzar a la semana siguiente y regresar. | No hay duplicación tras recarga; se permite una nueva concesión al cambiar de semana. | PENDIENTE |
| E2E-REW-01 | Recoger recompensa verde; guardar; recargar; regresar al mismo lugar. | No se repite oro, experiencia ni tesoro ya otorgado. | PENDIENTE |
| E2E-SAV-01 | Tras conquista, reclutamiento y recompensa, exportar/guardar; cerrar y reabrir; comparar día, recursos, tropas, minas, castillos, recompensas y visitas semanales. | Igualdad de estado; sin pérdida ni duplicación. | PENDIENTE |
| E2E-MAP-01 | Visitar los 44 elementos identificados (7 castillos, 10 minas, 1 molino, 15 recompensas, 11 reclutamientos). | Entradas accesibles, sin atravesar obstáculos ni desviaciones indebidas; interacción coherente con cada categoría. | PENDIENTE |
| E2E-ITCH-01 | Generar el paquete itch.io desde el commit probado y ejecutar el verificador de paridad; abrirlo por HTTPS en un iframe equivalente al de itch.io. | Mapa y máscara turquesa iguales, carga sin errores, rutas e interacciones operativas. | PENDIENTE |
| E2E-ITCH-02 | Repetir E2E-ECO-02, REC-02, REW-01 y SAV-01 en la edición invitado. | Mismas reglas y persistencia local; no exigir autenticación o guardado en nube en modo invitado. | PENDIENTE |

## Condiciones de cierre
1. Registrar **APROBADO** o **FALLIDO** por caso, con commit, navegador y evidencia. No marcar aprobados por la mera existencia de tests.
2. Ante pérdida de progreso, duplicación de recursos o bloqueo de navegación, detener la aceptación y abrir incidencia reproducible; corregir, añadir regresión y repetir.
3. Confirmar GitHub Actions del commit exacto y despliegue de Pages por separado.
4. Solo después de la prueba interactiva en HTTPS/iframe y aprobación de paridad, valorar publicación externa del paquete itch.io.
5. Incorporar resultados verificados y enlaces de evidencias al plan maestro; no cerrar fase 1/E2E sin las demás pruebas pendientes.
