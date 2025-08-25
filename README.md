# AlbumsOfCommunitiesBot

Este es un bot de Telegram diseñado para ayudar a las comunidades a gestionar y archivar sus medios (fotos y videos) de forma organizada en álbumes de Google Drive.

## ¿Qué es?

Cuando los miembros de un grupo de Telegram envían fotos o videos, este bot los carga automáticamente en una carpeta específica de Google Drive que funciona como un "álbum" para el grupo. Solo un álbum puede estar activo a la vez. El bot se gestiona a través de comandos y una interfaz de chat privado.

![Foto](/images/Foto.webp)

## Características

-   **Carga automática:** Sube automáticamente las fotos y videos enviados a un grupo de Telegram a la carpeta de Google Drive designada.
-   **Gestión de álbumes:** Permite crear, eliminar y activar/desactivar álbumes para cada grupo.
-   **Múltiples grupos:** El bot puede gestionar los álbumes de varios grupos de Telegram.
-   **Notificaciones:** Informa al grupo sobre acciones importantes como la creación/eliminación de álbumes o la subida de nuevos archivos, permitiendo a cualquier participante eliminar una foto o video del álbum.
-   **Configuración privada:** La gestión de los álbumes se realiza en un chat privado con el bot para no saturar el chat del grupo.

## Comandos

-   `/start` o `/help`: Muestra un mensaje de ayuda inicial.

![Help](/images/Help.webp)

-   `/albums`: Inicia el proceso de gestión de álbumes para el grupo actual. Este comando debe ejecutarse en un chat de grupo, pero la configuración continúa en un chat privado con el bot.

## Uso

Se puede usar gratuitamente el bot [@AlbumsOfCommunitiesBot](http://t.me/AlbumsOfCommunitiesBot) sumándolo a un grupo de Telegram.

## Instrucciones

1.  **Añadir el bot a un grupo:** Invita a tu bot a cualquier grupo de Telegram donde quieras gestionar álbumes.
2.  **Iniciar la configuración:** Escribe `/albums` en el chat del grupo. Recibirás un mensaje pidiéndote que continúes la configuración en un chat privado.
3.  **Crear un álbum:**
    -   En el chat privado, podrás crear un nuevo álbum.
    -   El bot te pedirá un nombre para el álbum.
    -   Luego, te pedirá la URL de una carpeta de Google Drive. **Importante:** Debes asegurarte de que el bot tenga permisos de edición en esa carpeta.
4.  **Activar un álbum:** Una vez creado, puedes activarlo. Las fotos y videos que se envíen al grupo a partir de ese momento se subirán a esa carpeta (límite de 25Mb por elemento). Cualquier miembro del grupo de Telegram puede eliminar una foto o video que fue subido a un álbum.

[Más Información](https://thomaswallet.substack.com/publish/post/160280277)
