# AlbumsOfCommunitiesBot

Este es un bot de Telegram diseñado para ayudar a las comunidades a gestionar y archivar sus medios (fotos y videos) de forma organizada en álbumes de Google Drive.

## ¿Qué es?

Cuando los miembros de un grupo de Telegram envían fotos o videos, este bot los carga automáticamente en una carpeta específica de Google Drive que funciona como un "álbum" para el grupo. Solo un álbum puede estar activo a la vez. El bot se gestiona a través de comandos y una interfaz de chat privado.

## Características

-   **Carga automática:** Sube automáticamente las fotos y videos enviados a un grupo de Telegram a la carpeta de Google Drive designada.
-   **Gestión de álbumes:** Permite crear, eliminar y activar/desactivar álbumes para cada grupo.
-   **Múltiples grupos:** Un solo bot puede gestionar los álbumes de varios grupos de Telegram.
-   **Notificaciones:** Informa al grupo sobre acciones importantes como la creación/eliminación de álbumes o la subida de nuevos archivos.
-   **Configuración privada:** La gestión de los álbumes se realiza en un chat privado con el bot para no saturar el chat del grupo.

## Comandos

-   `/start` o `/help`: Muestra un mensaje de ayuda inicial.
-   `/albums`: Inicia el proceso de gestión de álbumes para el grupo actual. Este comando debe ejecutarse en un chat de grupo, pero la configuración continúa en un chat privado con el bot.

## Instalación y Configuración

Para desplegar tu propia instancia de este bot, sigue estos pasos:

1.  **Crear un Bot de Telegram:**
    -   Habla con [@BotFather](https://t.me/BotFather) en Telegram.
    -   Usa el comando `/newbot` para crear un nuevo bot.
    -   Guarda el **token de acceso (API Token)** que te proporciona.

2.  **Crear una Hoja de Cálculo de Google (Google Sheet):**
    -   Crea una nueva hoja de cálculo en [Google Sheets](https://sheets.new).
    -   Esta hoja se usará para almacenar la configuración de los álbumes. Necesitarás su **ID**. Puedes obtenerlo de la URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
    -   La primera hoja (pestaña) debe tener las siguientes columnas en este orden: `group_id`, `group_name`, `album_name`, `drive_id`, `active`.

3.  **Configurar el Proyecto de Google Apps Script:**
    -   Ve a [Google Apps Script](https://script.google.com/home) y crea un nuevo proyecto.
    -   Copia el contenido de cada archivo `.gs` de este repositorio en archivos correspondientes dentro de tu proyecto de Apps Script.
    -   Abre el archivo `Constants.gs` y rellena las siguientes variables:
        -   `BOT_TOKEN`: Tu token de acceso del bot de Telegram.
        -   `BOT_ID`: El ID de tu bot (lo puedes obtener de @userinfobot).
        -   `BOT_URL`: El enlace a tu bot (ej: `https://t.me/your_bot_name_bot`).
        -   `ALBUMS_SPREADSHEET_ID`: El ID de tu hoja de cálculo de Google.

4.  **Desplegar como Aplicación Web:**
    -   En el editor de Apps Script, haz clic en **Deploy > New deployment**.
    -   Selecciona el tipo de despliegue **Web app**.
    -   En la configuración:
        -   **Description:** Dale una descripción (ej: "Bot de Álbumes de Telegram").
        -   **Execute as:** `Me`.
        -   **Who has access:** `Anyone`.
    -   Haz clic en **Deploy**.
    -   Copia la **Web app URL** que se genera. La necesitarás para el siguiente paso.

5.  **Establecer el Webhook:**
    -   En el archivo `Constants.gs`, pega la **Web app URL** en la variable `WEBAPP_URL`.
    -   En el editor de Apps Script, selecciona la función `setWebhook` en el menú desplegable y haz clic en **Run**. Esto le dirá a Telegram a dónde enviar las actualizaciones.

¡Y listo! Tu bot debería estar en funcionamiento.

## Uso

1.  **Añadir el bot a un grupo:** Invita a tu bot a cualquier grupo de Telegram donde quieras gestionar álbumes.
2.  **Iniciar la configuración:** Escribe `/albums` en el chat del grupo. Recibirás un mensaje pidiéndote que continúes la configuración en un chat privado.
3.  **Crear un álbum:**
    -   En el chat privado, podrás crear un nuevo álbum.
    -   El bot te pedirá un nombre para el álbum.
    -   Luego, te pedirá la URL de una carpeta de Google Drive. **Importante:** Debes asegurarte de que el bot tenga permisos de edición en esa carpeta. Para ello, comparte la carpeta con la cuenta de Google con la que creaste el proyecto de Apps Script.
4.  **Activar un álbum:** Una vez creado, puedes activarlo. Las fotos y videos que se envíen al grupo a partir de ese momento se subirán a esa carpeta (límite de 25Mb por elemento). Cualquier miembro del grupo de Telegram puede eliminar una foto o video que fue subido a un albúm.

[Más Información](https://thomaswallet.substack.com/publish/post/160280277)
