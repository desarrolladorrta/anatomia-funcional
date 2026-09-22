# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite, desplegado como sitio estatico en GitHub Pages. El registro centralizado de resultados se integra con Google Sheets mediante un endpoint de Google Apps Script configurable en el despliegue.

## Users

Estudiantes de pregrado de Anatomia Funcional que completan individualmente una actividad de clase sobre el esqueleto axial y apendicular. El docente revisa los resultados y las justificaciones abiertas.

## Product Purpose

Convertir el material de clase en un REDI tipo Escape Room que permita identificar, ubicar y clasificar huesos, y relacionarlos con el movimiento humano y situaciones deportivas. El exito consiste en completar cinco pruebas, justificar las respuestas y obtener el codigo final de salida.

## Positioning

La progresion combina verificacion automatica de conocimientos anatomicos con justificaciones breves que conservan la evaluacion reflexiva del material original.

## Operating Context

Actividad individual de aula de 45 a 60 minutos, utilizable desde computador, tableta o telefono. El estudiante avanza por cinco retos y el docente puede consultar los resultados enviados a una hoja de calculo.

## Capabilities and Constraints

- Cinco retos basados en el PDF suministrado: clasificacion, regiones, movimiento, huesos misteriosos y caso deportivo final.
- Retroalimentacion inmediata, pistas limitadas, puntaje, progreso y temporizador.
- Persistencia local de una sesion en curso y envio final opcional a Google Sheets.
- Debe funcionar como sitio estatico en GitHub Pages; ninguna clave privada puede llegar al cliente.
- La URL del Apps Script es una configuracion de despliegue, no un secreto.
- Las respuestas abiertas requieren revision docente y no se califican automaticamente como conocimiento definitivo.

## Brand Commitments

Institucion CECAR. Deben utilizarse el logotipo blanco y el favicon existentes en `assets/`. El producto se presenta en espanol con una voz academica, clara, motivadora y apropiada para pregrado.

## Evidence on Hand

- `docs/Escape_Room_Esqueleto_Axial_Apendicular.pdf`: estructura de la actividad, respuestas y rubrica.
- `docs/ESQUELETO AXIAL [Recuperado].pptx`: contenidos del esqueleto axial y aplicaciones funcionales.
- `docs/ESQUELETO APENDICULAR.pptx`: contenidos del esqueleto apendicular y aplicaciones funcionales.
- `assets/logo-cecar.png` y `assets/favicon.ico`: recursos institucionales.

## Product Principles

- La interaccion debe reforzar el razonamiento anatomico, no sustituirlo por azar.
- Cada reto debe ser comprensible, breve y ofrecer retroalimentacion util.
- El avance debe sentirse como una mision continua sin volver compleja la navegacion.
- La experiencia debe seguir siendo util si falla el envio a Google Sheets.
- Solo se solicitan los datos personales minimos necesarios para identificar el resultado.

## Accessibility & Inclusion

La experiencia debe ser operable con teclado, legible con contraste suficiente, compatible con reduccion de movimiento y adaptable a pantallas pequenas sin depender exclusivamente del color.
