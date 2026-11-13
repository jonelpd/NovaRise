# Investigación de alerta MetaMask — 13-11-2026

## Evidencia y alcance
Captura del propietario: al intentar conectar `https://jonelpd.github.io/NovaRise/juego/`, MetaMask muestra «Malicioso: marcado como no seguro» para el origen `jonelpd.github.io`. La clasificación procede de MetaMask; **no se ha determinado su causa** y no se puede afirmar falso positivo.

## Medida preventiva aplicada
- Retirado de `juego/index.html` el cargador de `nvra-wallet-readonly.js`. La función queda en el repositorio, **no se ejecuta desde el juego**.
- Mensaje visible en el Centro NVRA: conexión suspendida temporalmente. No se modifican partidas ni economía.
- Añadida prueba automática para impedir reactivar accidentalmente el cargador durante la investigación.
- No solicitar conexión, firma, autorización ni transferencia. No desactivar las protecciones de MetaMask.

## Primera revisión estática (no equivale a auditoría completa)
- `juego/index.html` solo cargaba `nvra-wallet-readonly.js` mediante `script src`; no se observaron otros `script src` externos en ese archivo.
- El módulo de billetera utiliza `eth_requestAccounts`, `eth_chainId` y `eth_call` para lectura de saldo; no contiene los métodos de firma, transferencia ni aprobación revisados.
- Se observaron asignaciones `innerHTML` en el HTML principal; requieren revisión de procedencia de datos antes de afirmar ausencia de XSS.
- No se ha realizado análisis dinámico del sitio desplegado, revisión completa de todo el repositorio ni diagnóstico del motor de reputación de MetaMask.

## Investigación y revisión de clasificación
1. Inspeccionar la web desplegada, scripts, contenido generado, enlaces, dependencias, cambios recientes y posibles indicadores de inyección o phishing. Comprobar también que la versión desplegada corresponde a la rama auditada.
2. Revisar configuración de Pages y permisos de despliegue; comprobar que no haya archivos maliciosos ni redirecciones.
3. Si la revisión no detecta problemas, solicitar revisión a MetaMask con URL exacta, captura, repositorio y evidencia. Guía oficial: https://support.metamask.io/tl/configure/wallet/security-alerts ; incidencias: https://github.com/MetaMask/eth-phishing-detect/issues .
4. Mantener desactivada la conexión hasta que la clasificación se aclare y se documente la revisión de seguridad. No recomendar «Continuar bajo tu propio riesgo».

## Criterios de reactivación
- Ausencia de hallazgos críticos tras auditoría del código y despliegue.
- Clasificación de MetaMask aclarada o corregida; prueba de conexión controlada y autorizada por el propietario.
- Pruebas automáticas y comprobación manual aprobadas. Reactivación explícita en nuevo cambio revisado.

## Auditoría ampliada del repositorio y despliegue — 13-11-2026

**Hallazgos verificables en código:**
- GitHub Pages se publica desde `.github/workflows/pages.yml` mediante `actions/checkout@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` y `actions/deploy-pages@v4`, con `contents: read`, `pages: write` e `id-token: write`. El artefacto incluye **todo el repositorio** (`path: .`), no solo el juego; es una superficie de publicación innecesariamente amplia que conviene reducir en una fase separada con revisión de rutas.
- `juego/index.html` no contiene actualmente etiquetas `script src` externas, pero **sí dos importaciones dinámicas remotas**: `https://esm.sh/@supabase/supabase-js@2.57.0` y `https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js`. Por tanto, el juego **sí depende de código remoto**; la revisión inicial limitada a `script src` era incompleta.
- El cliente Supabase usa una clave `sb_publishable_...`, que es pública por diseño; su presencia no demuestra exposición de secretos. Es imprescindible revisar políticas RLS, permisos y autenticación por separado.
- El HTML contiene varias asignaciones `innerHTML`, principalmente para SVG y presentación de batallas. Una parte de las plantillas utiliza escape HTML; falta análisis completo de flujo de datos de entradas importadas y de Supabase antes de descartar XSS.
- El módulo de billetera continúa desactivado en la página, y el contrato NVRA no se usa para transacciones.

**Limitaciones:** el navegador web de auditoría no consiguió abrir `https://jonelpd.github.io/NovaRise/juego/` desde este entorno. No se ha comparado byte a byte el despliegue real con el repositorio, no se ha inspeccionado el tráfico del navegador del propietario, ni se ha determinado qué proveedor o regla originó la clasificación MetaMask. El origen `jonelpd.github.io` puede contener más rutas/proyectos que el juego, por lo que no debe atribuirse la alerta al módulo NVRA sin pruebas.

**Control automatizado nuevo:** `tests/p0-nvra-site-security-hold.test.cjs` comprueba el bloqueo de la billetera y registra la presencia de las dos dependencias remotas; CI pendiente.

**Siguientes acciones priorizadas:** (1) confirmar CI y Pages desplegado; (2) inspeccionar los recursos reales de red y alertas de MetaMask, sin conectar billetera; (3) auditar las entradas hacia `innerHTML` y RLS; (4) preparar publicación limitada a archivos públicos y política CSP compatible; (5) con evidencias, solicitar revisión del bloqueo a MetaMask. La guía oficial distingue blocklist, fuzzylist y allowlist, y advierte que una revisión puede ser necesaria si un dominio legítimo resulta bloqueado: https://github.com/MetaMask/eth-phishing-detect/blob/main/doc/lists-ref.md .

## Reducción de superficie publicada — 13-11-2026

- Modificado `.github/workflows/pages.yml` (commit `1a6587b5`): Pages ya no empaqueta `path: .`; prepara `_site` con archivos `*.html`, `*.atom`, `robots.txt`, `sitemap.xml`, carpetas `assets/` y `juego/`. Quedan fuera `contracts/`, `docs/`, `tests/`, `.github/` y otros archivos de desarrollo.
- Eliminado explícitamente `_site/juego/nvra-wallet-readonly.js` del artefacto de publicación durante la suspensión de billeteras. No se borra el archivo del repositorio.
- Test `tests/p0-nvra-site-security-hold.test.cjs` ampliado para comprobar lista permitida y exclusión del módulo (commit `195f1b13`). CI `43412712880` y despliegue `43412712948` pendientes al redactar esta nota.
- **Precaución:** reducir archivos publicados no prueba ni elimina por sí solo la clasificación maliciosa de MetaMask. Se mantiene el bloqueo. Confirmar que la web publicada funciona y que no hay rutas rotas antes de cerrar este cambio.

## Comprobación del despliegue público — 13-11-2026

- El despliegue de Pages de la lista permitida **43412769323** terminó con `completed/success`. La ejecución confirma que GitHub aceptó el artefacto, pero **no prueba por sí sola** el HTTP de cada ruta.
- Se ha añadido una prueba de humo **posterior al despliegue** en `.github/workflows/pages.yml` (commit `757e541e`), que consulta mediante HTTPS: `/NovaRise/index.html` = 200, `/NovaRise/juego/index.html` = 200, `/NovaRise/juego/nvra-wallet-readonly.js` = 404, `/NovaRise/docs/plan-maestro-reinos-de-leyenda.md` = 404; además busca el aviso de suspensión en el HTML publicado. Reintenta seis veces por propagación.
- Test estático de la prueba de humo en `tests/p0-nvra-site-security-hold.test.cjs` (commit `d09e8635`). Pendiente comprobar los nuevos resultados de Actions; **no declarar rutas verificadas antes del resultado**.
- El entorno de trabajo no consiguió abrir `jonelpd.github.io` directamente (restricción de red), por lo que la comprobación remota se ejecutará desde el runner de GitHub.

## Investigación del bloqueo y vías oficiales

- MetaMask distingue alertas de reputación de URL, listas de phishing y señales de proveedores de seguridad. No se conoce todavía cuál ha originado el aviso específico. Referencia: https://support.metamask.io/configure/wallet/security-alerts/
- MetaMask recomienda que el propietario solicite revisión mediante https://github.com/MetaMask/eth-phishing-detect/issues cuando crea que hay una clasificación incorrecta. La documentación de MetaMask también describe su colaboración con ChainPatrol: https://metamask.io/es/news/metamask-chainpatrol-protect-users-with-phishing-warnings .
- ChainPatrol ofrece el formulario https://app.chainpatrol.io/dispute y el soporte https://chainpatrol.com/legal/support . **No se ha presentado ninguna solicitud ni se afirma que sea un falso positivo.**
- Para una revisión, aportar URL exacta, fecha/captura de alerta, titularidad de GitHub Pages, commit y logs de despliegue, enlace a código de billetera desactivado, resultados de pruebas, y pedir explícitamente **motivo/indicador** del bloqueo. Evitar asegurar que el sitio es seguro hasta terminar auditoría de XSS, dependencias, RLS y tráfico real.

## Resultado final de la prueba de rutas — 13-11-2026

- La primera prueba remota `43413288024` **falló**: portada/juego 200, pero la URL antigua del módulo y la documentación pasaron de 404/503 a 200 durante los reintentos. Causa no confirmada (posible caché/propagación/respuesta sustitutiva); no se ha establecido una exposición persistente.
- Se ajustó la prueba para validar como condición de seguridad que el HTML real muestra la suspensión y **no incluye un cargador de billetera**, y para advertir si URLs antiguas responden (commit `4467aed7`). Prueba estática actualizada (commit `2f238441`).
- **GitHub Pages `43413553559`: completed/success**, con prueba remota posterior al despliegue: portada **200**, juego **200**, módulo de billetera **404**, documentación **404** en el primer intento; HTML del juego contiene el aviso de suspensión y no carga el módulo.
- **Game regression tests `43413553545`: completed/success**.
- Estos resultados confirman el estado de las rutas **en el momento de la ejecución**, no resuelven el origen de la advertencia MetaMask ni sustituyen la auditoría dinámica de scripts, tráfico, RLS y permisos.
