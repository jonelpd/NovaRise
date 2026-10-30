# Auditoría integral de NovaRise Analítica — primera pasada (30-10-2026)

## Alcance revisado
Inventario completo del árbol del repositorio: 99 entradas (archivos y directorios). Inspección del contenido público en 11 páginas HTML, estilos globales, JavaScript del analizador, portal Base, antiguo Access Pass, registro de interesados, CRM y flujos de CI. Se contrastaron referencias internas, enlaces y anclas de las páginas públicas; no se encontraron destinos locales inexistentes en la comprobación del 30-10-2026.

**Importante:** es una primera pasada técnica y editorial; no es una auditoría externa de seguridad ni una certificación de accesibilidad. No se han probado dispositivos físicos, rendimiento en producción, permisos RLS de Supabase ni contratos desplegados.

## Decisiones de producto vigentes
- Nombre público: NovaRise Analítica / NovaRise Analytics.
- Base Mainnet (8453) es la red objetivo para producción. El gas se paga en ETH.
- Suministro fijo proyectado: 1.000.000 NVRA, 18 decimales; sin despliegue real ni oferta.
- Juegos, aplicaciones, analítica/IA, servicios Web3 y participación comunitaria son **planes de producto**, no servicios NVRA disponibles.
- Polygon Amoy (100.000.000 tokens de prueba) es únicamente un registro histórico sin valor monetario.

## Hallazgos y medidas
| Prioridad | Hallazgo | Medida | Estado |
|---|---|---|---|
| Alta | CI dependía de frases, secciones y estructuras anteriores | Revisión de aserciones y tolerancia numérica para cálculo de variación histórica | Aplicada; pendiente de CI final |
| Alta | La portada destacaba el antiguo lanzamiento experimental Amoy | Convertido en archivo histórico plegable, con Base como objetivo principal | Aplicada |
| Alta | El Portal Base no tenía equivalente en inglés | Creada versión inglesa y mensajes bilingües del script | Aplicada |
| Media | Portal Base con CSS embebido y apariencia diferente | Reglas trasladadas a hoja global y navegación ES/EN | Aplicada |
| Media | Falta detección de enlaces internos y anclas rotas | Nueva prueba automatizada sobre 11 páginas, integrada en CI | Aplicada; pendiente de CI final |
| Media | La web no distinguía suficientemente las aplicaciones previstas de las existentes | Sección pública con estado por producto y avisos de no lanzamiento | Aplicada |
| Alta | Access Pass antiguo sigue consultando Polygon Amoy | Se mantiene exclusivamente como demo histórica; no reutilizar como verificador Base | Documentado; futura unificación |
| Alta | La seguridad del CRM depende de políticas Supabase/RLS no verificadas en esta pasada | Auditar permisos, autorización del administrador, exposición de datos y borrados | Pendiente |
| Alta | Contratos de vesting, bóvedas y Safe no cuentan con auditoría externa de producción | Revisión independiente y control de custodia antes de Base mainnet | Bloqueante |
| Media | Algunos textos de documentación técnica siguen reflejando Polygon como hipótesis anterior | Mantener documentos históricos etiquetados y actualizar documentos vigentes | Pendiente |
| Media | GitHub Actions muestra advertencias de versiones de actions/runner | Planificar actualización y comprobar compatibilidad | Pendiente |
| Media | Accesibilidad real, contraste y UX móvil no verificadas en navegador físico | Pruebas visuales y teclado, lector de pantalla y tamaños de pantalla | Pendiente |

## Criterios de aceptación de la siguiente fase
1. CI estático verde y pruebas de contratos independientes verdes en el commit final.
2. Comprobar publicación de Pages y equivalencia ES/EN.
3. Verificar formularios, CRM, autenticación y RLS con pruebas autorizadas, sin exponer datos personales.
4. Revisar visualmente en móvil y escritorio, navegación de teclado y estados de error.
5. Revisar tokenómica y documentación legal de producción antes de desplegar NVRA.

No se han firmado transacciones ni desplegado contratos a Base. No introducir claves privadas en CI o repositorio.
