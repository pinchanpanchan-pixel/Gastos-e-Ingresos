# Mis Finanzas

App personal de gastos e ingresos (PWA instalable, funciona offline). Pensada para sustituir la hoja de cálculo de Google Sheets.

## Funcionalidades

- Añadir gastos e ingresos a mano o **por voz** (categoría sugerida automáticamente, con confirmación antes de guardar).
- Cuentas: Revolut, Billetes y Monedas (con contador de billetes/monedas por denominación).
- Categorías personalizables con presupuesto mensual y avisos al superarlo.
- Deudas (quién te debe / a quién debes), afectan al balance total.
- Metas de ahorro con varias metas activas a la vez.
- Movimientos recurrentes (paga, gastos fijos).
- Gráficas: gasto por categoría, comparativa mensual, evolución del balance, ranking de gastos.
- Exportar a CSV y copia de seguridad/restauración completa.
- Bloqueo con PIN y huella/Face ID (WebAuthn).
- Todo configurable desde Ajustes.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción (genera el service worker de la PWA)
npm run preview  # previsualizar el build
```

Los datos se guardan en IndexedDB, en el propio dispositivo — no hay backend ni servidor.

## Instalar como app

Con el build desplegado (por ejemplo en Vercel, Netlify o GitHub Pages), abre la web desde el móvil y usa "Añadir a pantalla de inicio" (Android/Chrome) para instalarla como una app normal, con icono propio y funcionamiento offline.
