# NVRA — Preparación del primer despliegue en Polygon Amoy (v0.2)

**ESTADO: PREPARADO, NO DESPLEGADO.** Este documento NO autoriza ejecutar una transacción. El token NVRA es un prototipo experimental sin valor monetario prometido.

## Datos aprobados para preparar el procedimiento

| Parámetro | Valor |
|---|---|
| Red | Polygon Amoy Testnet |
| Chain ID | 80002 (hexadecimal 0x13882) |
| RPC usado por el monedero | https://polygon-amoy.drpc.org |
| Explorador | https://amoy.polygonscan.com |
| Contrato fuente | `contracts/NVRAToken.sol` |
| Constructor | `constructor(address treasury)` |
| Tesorería **propuesta**, solo pruebas | `0x58f15EA8C1Fb2a783dB296d6F65020B4Ab8cBE77` |
| Nombre / símbolo | NovaRise Utility Token / NVRA |
| Decimales | 18 |
| Suministro inicial y máximo | 100.000.000 NVRA |
| Saldo testnet observado en captura de usuario | 0,1 POL (no verificado en tiempo real) |
| Contrato desplegado / dirección / transacción | **No / ninguna / ninguna** |

La tesorería propuesta es una **dirección pública** facilitada por el usuario; nunca introducir una frase semilla, clave privada o contraseña en GitHub, Remix o este chat.

## Opción de despliegue: Remix + MetaMask (solo cuando se autorice por separado)

1. En un navegador con MetaMask compatible, abrir **https://remix.ethereum.org/** escribiendo la dirección manualmente. Verificar que se trata del editor oficial.
2. Cargar el código del contrato y sus dependencias de OpenZeppelin **con versiones reproducibles**. Antes de desplegar, asegurar que se compila el mismo código que pasó las pruebas CI. El import de `@openzeppelin/contracts` requiere resolver esa dependencia; no pegar contratos o importaciones obtenidos de fuentes desconocidas.
3. En **Solidity Compiler**, seleccionar **0.8.24**, activar el optimizador con **200 runs**, compilar `NVRAToken.sol` y comprobar que no hay errores. Revisar el bytecode y el constructor.
4. En **Deploy & Run Transactions**, seleccionar **Injected Provider - MetaMask** (el nombre puede variar según la versión). Confirmar que la conexión de MetaMask indica **Polygon Amoy, chain ID 80002**, y que la cuenta firmante es la deseada. No continuar si indica Polygon mainnet o Ethereum mainnet.
5. Seleccionar `NVRAToken`. En el parámetro `treasury`, introducir exclusivamente `0x58f15EA8C1Fb2a783dB296d6F65020B4Ab8cBE77`. Comprobarlo carácter por carácter.
6. **DETENERSE AQUÍ para obtener autorización explícita de la transacción.** Antes de pulsar `Deploy`, revisar el coste de gas en POL de prueba y que el monedero muestre Amoy. Una transacción confirmada no puede deshacerse.
7. Solo tras la autorización: firmar en MetaMask sin exportar claves ni introducir frases de recuperación en páginas web.

> **Limitación práctica:** MetaMask móvil no siempre ofrece el mismo flujo de proveedor inyectado que una extensión de escritorio. Si el navegador no permite conectar Remix con MetaMask de forma segura, usar el ordenador con la extensión oficial; **no** exportar la clave privada para resolverlo.

## Verificaciones obligatorias después de un eventual despliegue

- Registrar hash de transacción, dirección del contrato, número de bloque, chain ID y dirección de tesorería.
- Confirmar `name() == "NovaRise Utility Token"`, `symbol() == "NVRA"`, `decimals() == 18`.
- Confirmar `MAX_SUPPLY() == totalSupply() == 100000000000000000000000000` unidades base.
- Confirmar `balanceOf(treasury) == totalSupply()` inicialmente.
- Confirmar que no existe mint posterior, proxy de actualización, congelación o privilegios de administrador.
- Verificar fuente y parámetros del constructor en el explorador de Amoy; ejecutar transferencias de **prueba** únicamente después de revisar las direcciones.
- Etiquetar toda referencia al token y su contrato como **TESTNET / EXPERIMENTAL / SIN VALOR MONETARIO**.

## Límites de seguridad

- La dirección pública de la tesorería puede coincidir con la cuenta firmante, pero el constructor no lo exige.
- Una dirección con formato correcto no acredita por sí sola control de la clave ni saldo actual.
- El saldo de 0,1 POL mostrado en una captura no garantiza que cubra el coste del despliegue; comprobar la estimación de gas antes de autorizar.
- Este documento no sustituye auditoría de seguridad, tokenomics finales, gobierno de tesorería ni revisión legal.
