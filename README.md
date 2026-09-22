# Mision: liberar el esqueleto

REDI tipo Escape Room para estudiantes de Anatomia Funcional. Incluye cinco retos, retroalimentacion inmediata, puntaje, pistas, progreso local, reporte descargable y envio opcional a Google Sheets.

## Desarrollo

Requiere Node.js 20.19 o superior.

```bash
npm install
npm run dev
```

La compilacion de produccion se genera con:

```bash
npm run build
npm run preview
```

## Google Sheets

1. Crea una hoja de calculo vacia en Google Sheets.
2. Abre `Extensiones > Apps Script` y pega el contenido de `google-apps-script/Code.gs`.
3. En `Configuracion del proyecto > Propiedades de la secuencia de comandos`, crea `SPREADSHEET_ID` con el identificador de la hoja. Es el texto situado entre `/d/` y `/edit` en la URL.
4. Ejecuta `setup()` una vez y concede los permisos solicitados.
5. Selecciona `Implementar > Nueva implementacion > Aplicacion web`.
6. Ejecuta como tu cuenta y permite acceso a cualquier usuario que tenga el enlace.
7. Copia la URL terminada en `/exec` y guardala como `VITE_RESULTS_ENDPOINT` en un archivo `.env.local` para desarrollo.

La URL del Apps Script no es una credencial privada. El script valida la estructura de la actividad, limita longitudes y evita que las respuestas se interpreten como formulas en Sheets.

## GitHub Pages

El flujo `.github/workflows/deploy.yml` compila y publica la carpeta `dist` al enviar cambios a `main`.

1. En GitHub, abre `Settings > Secrets and variables > Actions`.
2. Crea el secreto `VITE_RESULTS_ENDPOINT` con la URL de Apps Script.
3. En `Settings > Pages`, selecciona `GitHub Actions` como fuente.

El proyecto usa rutas relativas, por lo que funciona tanto en un dominio propio como bajo `usuario.github.io/repositorio/`.

## Privacidad y evaluacion

- Solo se solicita nombre y grupo opcional.
- El avance se conserva en `localStorage` del navegador.
- Las respuestas abiertas se envian para revision docente y no se califican semanticamente en el cliente.
- El token de OpenAI se usa solo para generar recursos durante el desarrollo. Nunca se incluye en el sitio compilado.
