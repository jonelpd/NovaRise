# NVRA — rectificación del hallazgo de suministro (29 octubre 2026)

## Estado: discrepancia anteriormente anunciada NO CONFIRMADA

Este documento rectifica el informe anterior, que interpretó el suministro de la salida RPC como **1.000.000 NVRA** sin verificar correctamente la conversión de unidades de 18 decimales. Esa conclusión no debe usarse como evidencia de una discrepancia de suministro.

## Nueva evidencia de despliegue (captura de PolygonScan aportada por el usuario)
- Red: Polygon Amoy (testnet), chain ID 80002.
- Transacción: `0x5585f12072e847257ef8c093cc62f248ca971858c71f7d8aafd9880c88b872cb`.
- Bloque: `51351109`.
- Fecha UTC: 2026-10-28 07:47:54.
- Creador: `0x58f15EA8C1Fb2a783dB296d6F65020B4Ab8cBE77`.
- Contrato creado: `0xCCC748d63333F9aF58f259CDF771d5AB1226e20D`.
- Evento ERC-20 de emisión inicial (Transfer desde dirección cero): **100.000.000 NVRA** hacia la cartera creadora.
- La transacción aparece como exitosa en la captura.

El archivo `contracts/NVRAToken.sol` acuña 100.000.000 NVRA en el constructor; el evento de creación y el código fuente son coherentes en ese aspecto. El evento de creación no equivale por sí solo a una comprobación del suministro **actual**, ni demuestra identidad de bytecode.

## Comprobación pendiente
1. Volver a obtener `totalSupply()` y `balanceOf(treasury)` como enteros sin decimales; convertir dividiendo entre `10**18` y mostrar ambas representaciones.
2. Comparar código de ejecución y artefactos de compilación reproducible, incluidos metadatos.
3. Verificar código fuente, versión de compilador, optimizador, constructor y privilegios en el explorador.

**No se ha demostrado una discrepancia de suministro.** Tampoco se ha demostrado aún equivalencia de código fuente ni auditoría de seguridad. No se deben modificar el contrato ni los valores históricos para hacerlos coincidir.
