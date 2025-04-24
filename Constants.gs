const BOT_TOKEN = '---';
const TELEGRAM_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WEBAPP_URL = 'https://script.google.com/macros/s/---/exec';
const AOC_SHEETS_ID = '---';
const LOG_SHEET = { NAME: 'Log', LOGGING: true };
const MESSAGE_MAX_SIZE = 4096;
const FOLDERS_URL_PREFIX = 'https://drive.google.com/drive/folders/';
const ALBUMS_SHEET = { NAME: 'Albums', GROUP_ID_COL: 1, GROUP_TITTLE_COL: 2, ACTIVE_COL: 3, NAME_COL: 4, DRIVE_ID_COL: 5 };
const FILE_URL_PREFIX = 'https://drive.google.com/file/d/';
const FILE_BOT_PREFIX = 'https://api.telegram.org/file/bot';
const BOT_URL = 'https://t.me/AlbumsOfCommunitiesBot';
const DELETE_TEXT = '🗑 Quitar del álbum';
const BOT_ID = '---';
const TOAST_MAX_SIZE = 199;
const FILE_MAX_SIZE = 25 * 1024 * 1024; // 25 MB
const COMMANDS = ['/albums', '/help', '/start'];
const HELP = `<i>🤟 ¡Hola! Soy el bot <a href="${BOT_URL}">@AlbumsOfCommunities</a>. ` +
  'Ayudo en grupos de Telegram para automatizar la subida de fotos y vídeos a álbumes colaborativos.\n\n' +
  '👍 Para que pueda funcionar correctamente, necesito ser agregado a un grupo. No necesito permisos de administrador.\n\n' +
  '🎬 Con el comando /albums se puede activar un nuevo álbum de fotos para el grupo, y elegir su ubicación: una carpeta compartida de Google Drive.\n\n' +
  '📸 Luego subo automáticamente al álbum activo las fotos y vídeos enviados al grupo.\n\n' +
  '🗑 Aviso y doy la posibilidad a cualquier persona del grupo de eliminar en cualquier momento las fotos y vídeos que no quiera ver publicados en el álbum.\n\n' +
  '🚫 También con el comando /albums se puede desactivar un albúm, para que no se suban más las fotos y videos recibidos, y acceder a todos los álbumes disponibles del grupo.\n\n'+
  `⚠️ Para usar el comando /albums, es necesario que inicies antes el bot con <b>start</b> <a href="${BOT_URL}">aquí</a>.\n\n` +
  `🏋‍♀️ Cuidado (con los videos en particular), el bot solo puede cargar archivos de <b>hasta ${FILE_MAX_SIZE / 1024 / 1024} Mb</b>.\n\n` + 
  `🤖 Estoy en versión beta, no dudes en enviarme tu feedback <a href="https://forms.gle/7vVAvF5uGBKqrEZZA">aquí</a>. ¡Gracias!</i>`;
const CONFIG_ALBUMS = '⚙️ Configuración';
const CANCEL = '✖️ Cancelar';
const NEW_ALBUM = '➕ Crear álbum';
const DELETE_ALBUM = '🗑 Eliminar álbum';
const ACTIVATE_ALBUM = '🎬 Activar / Desactivar';
const CONFIRM_NEW = '✅ Crear álbum';
const ALBUMS_TX_SHEET = { NAME: 'Albums Tx', USER_COL: 1, STEP_COL: 2, GROUP_ID_COL: 3, GROUP_TITTLE_COL: 4, ACTIVE_COL: 5, NAME_COL: 6, DRIVE_ID_COL: 7 };
const NEW_ALBUM_NAME_STEP = 'NuevoÁlbum:Nombre';
const NEW_ALBUM_FOLDER_STEP = 'NuevoÁlbum:Carpeta';
const GROUP_SIZE_ALBUMS = 1;
const DELETE_KEY = 'Delete';
const CONFIRMATION = '✅ Confirmar';
const ACTIVATE_KEY = 'Activate';
const CONTINUE = '➡️ Terminar';
