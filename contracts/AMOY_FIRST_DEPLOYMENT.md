# NVRA — Primer despliegue en Polygon Amoy (registro actualizado)

**ESTADO: DESPLEGADO EN TESTNET — 28 de octubre de 2026.** NVRA es un token experimental de pruebas, sin valor monetario prometido. No está desplegado en Polygon mainnet.

## Registro del despliegue

| Campo | Dato |
|---|---|
| Red | Polygon Amoy Testnet |
| Chain ID | 80002 |
| Moneda de gas | POL de prueba |
| Contrato | `0xCCC748d63333F9aF58f259CDF771d5AB1226e20D` |
| Tesorería y creador | `0x58f15EA8C1Fb2a783dB296d6F65020B4Ab8cBE77` |
| Token | NovaRise Utility Token (NVRA) |
| Decimales | 18 (definidos por ERC20 de OpenZeppelin; comprobación independiente de lectura pendiente) |
| Emisión fija definida por código | 100.000.000 NVRA |
| Saldo observado de la tesorería | 100.000.000 NVRA (captura de Amoy Polygonscan) |
| Herramientas | Remix + MetaMask Browser Extension |
| Solidity | 0.8.34 (según sesión de Remix) |
| Hash completo de transacción | **Pendiente de registrar** |
| Bloque observado en captura | 51351109 |
| Comisión observada | 0,02826931 POL de prueba |

- [Contrato en Amoy Polygonscan](https://amoy.polygonscan.com/address/0xCCC748d63333F9aF58f259CDF771d5AB1226e20D)
- [Tesorería en Amoy Polygonscan](https://amoy.polygonscan.com/address/0x58f15EA8C1Fb2a783dB296d6F65020B4Ab8cBE77)
- Fuente del contrato: [NVRAToken.sol](./NVRAToken.sol).
- Manifest de red: [amoy.manifest.json](./amoy.manifest.json).

## Evidencias y alcance

Las capturas del despliegue muestran un contrato en «Deployed Contracts» de Remix, el aviso «Verification Successful», el contrato identificado por Polygonscan como NovaRise Utility Token (NVRA), una transacción «Create: NVRAToken» y la tenencia de 100.000.000 NVRA en la tesorería. La pantalla de MetaMask muestra «100.00 M NVRA».

Estos hechos **no sustituyen** una auditoría de seguridad, una comparación independiente del bytecode ni una validación legal. La verificación del código fuente en el explorador no equivale a una auditoría. El hash completo de la transacción debe recuperarse del explorador y registrarse antes de dar por cerrado el expediente técnico.

## Próximos controles

1. Recuperar el hash completo de la transacción de creación y comprobar su recibo.
2. Consultar `name()`, `symbol()`, `decimals()`, `totalSupply()`, `MAX_SUPPLY()` y `balanceOf(treasury)` mediante el explorador o RPC.
3. Revisar la coincidencia entre el bytecode desplegado y la versión fuente del repositorio y las dependencias utilizadas.
4. Realizar pruebas de transferencia con cantidades pequeñas y sin comprometer el saldo principal de la tesorería.
5. Identificar todo componente público como **TESTNET / EXPERIMENTAL / SIN VALOR MONETARIO**.

## Seguridad

Nunca publicar frases semilla ni claves privadas. No presentar NVRA como inversión ni como token de mainnet. Cualquier futura implementación de producción requiere revisión técnica, legal y de gobernanza separada.
