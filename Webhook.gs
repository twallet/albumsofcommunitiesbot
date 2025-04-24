function setWebhook() {
  /* Set webhook for the Telegram bot.
  This function sends a request to the Telegram API to set the specified webhook URL.
  Returns: the response from the Telegram API is logged for debugging purposes.*/

  // Send the request to set the webhook and log the response
  Logger.log(UrlFetchApp.fetch(`${TELEGRAM_URL}/setWebhook?url=${WEBAPP_URL}`));
}

function doPost(e) {
  /* This function handles incoming updates from Telegram, including messages and 
  callback queries. It processes commands and forwards the relevant data to 
  appropriate handler functions.
  Parameters: an object containing the incoming update data.*/

  try {
    const contents = JSON.parse(e.postData.contents); // Parse the incoming data
    log(['⤵️ Message received', contents]); // Log the received message

    // Handle bot added to a group
    if (contents.message && contents.message.new_chat_member && contents.message.new_chat_member.id == BOT_ID) {
      const groupName = contents.message.chat.title;
      log([`➕ The bot was added to group ${groupName}`]); // Log bot addition
      sendMessage(contents.message.chat.id, HELP); // Send help message
      return;
    }

    // Handle /help or /start command
    if (contents.message && contents.message.text && (contents.message.text.startsWith(COMMANDS[1]) || contents.message.text.startsWith(COMMANDS[2]))) {
      log([`🛂 Command ${contents.message.text} received`]); // Log the command
      sendMessage(contents.message.chat.id, HELP); // Send help message
      return;
    }

    // Handle /albums command
    if (contents.message && contents.message.text && contents.message.text.startsWith(COMMANDS[0])) {
      log([`🛂 Command ${COMMANDS[0]} received`]); // Log the command
      handleAlbumsCommand(contents); // Process albums command
      return;
    }

    // Handle received photo
    if (contents.message && contents.message.photo) {
      log(['📷 Photo received']); // Log photo reception
      handlePhoto(contents, true); // Handle photo message
      return;
    }

    // Handle received document (image/video)
    if (contents.message && contents.message.document) {
      if (isImage(contents.message.document)) {
        log(['📷 Photo received (as document)']); // Log document photo reception
        handlePhoto(contents, false); // Handle photo as document
      } else if (isVideo(contents.message.document)) {
        log(['📹 Video received (as document)']); // Log document video reception
        handleVideo(contents, false); // Handle video as document
      }
      return;
    }

    // Handle received video
    if (contents.message && contents.message.video) {
      log(['📹 Video received']); // Log video reception
      handleVideo(contents, true); // Handle video message
      return;
    }

    // Handle callback for file deletion
    if (contents.callback_query && contents.callback_query.data.startsWith(`${BOT_ID}_${DELETE_TEXT}`)) {
      log(['❌ Callback Delete File']); // Log delete file callback
      handleDeleteFileCallback(contents); // Process the file deletion
      return;
    }

    // Handle callback for managing albums
    if (contents.callback_query && contents.callback_query.data.startsWith(`${BOT_ID}_${CONFIG_ALBUMS}`)) {
      log(['⚙️ Callback Config Albums']); // Log config albums callback
      handleConfigAlbumsCallback(contents); // Process the configuration of albums
      return;
    }

    // Handle callback for creating an album
    if (contents.callback_query && contents.callback_query.data.startsWith(`${BOT_ID}_${NEW_ALBUM}`)) {
      log(['➕ Callback Create Album']); // Log create album callback
      handleNewAlbumCallback(contents); // Process the new album creation
      return;
    }

    // Handle callback for confirming album creation
    if (contents.callback_query && contents.callback_query.data.startsWith(`${BOT_ID}_${CONFIRM_NEW}`)) {
      log(['✅ Callback Confirm Album Creation']); // Log confirm album creation callback
      handleConfirmNewAlbumCallback(contents); // Confirm the album creation
      return;
    }

    // Handle callback for selecting an album to delete
    if (contents.callback_query && contents.callback_query.data.startsWith(`${BOT_ID}_${DELETE_ALBUM}`)) {
      log(['❌ Callback Select Album to Delete']); // Log select album to delete callback
      handleDeleteAlbumCallback(contents); // Process album deletion selection
      return;
    }

    // Handle callback for specific album deletion
    if (contents.callback_query && contents.callback_query.data.startsWith(`${BOT_ID}_${DELETE_KEY}`)) {
      log(['❌ Callback Album Selected']); // Log specific album selected for deletion
      handleDeleteSelectedAlbumCallback(contents); // Process the selected album deletion
      return;
    }

    // Processes a callback for canceling an action.
    if (contents.callback_query && contents.callback_query.data.startsWith(`${BOT_ID}_${CANCEL}`)) {
      log(['✖️ Cancellation']); // Log the cancellation event
      deleteMessage(contents.callback_query.message.chat.id, contents.callback_query.message.message_id); // Delete the callback message
      answerCallbackWithToast(contents.callback_query.id, '❌ Operación cancelada'); // Send a toast notification to the user
      return;
    }

    // Processes a callback for confirming the deletion of an album.
    if (contents.callback_query && contents.callback_query.data.startsWith(`${BOT_ID}_${CONFIRMATION}`)) {
      log(['✅ Confirmation']); // Log the confirmation event
      handleDeleteAlbumConfirmationCallback(contents); // Process the confirmation for album deletion
      return;
    }

    // Processes a callback for activating or deactivating an album.
    if (contents.callback_query && contents.callback_query.data.startsWith(`${BOT_ID}_${ACTIVATE_ALBUM}`)) {
      log(['🎬 Callback Activate/Deactivate']); // Log the activate/deactivate callback
      handleAlbumActivationCallback(contents); // Process the toggle for album activation
      return;
    }

    // Processes a callback for selecting a specific album to activate/deactivate.
    if (contents.callback_query && contents.callback_query.data.startsWith(`${BOT_ID}_${ACTIVATE_KEY}`)) {
      log(['🎬 Callback Album Selected']); // Log the selected album callback
      handleAlbumActivationUpdateCallback(contents); // Process the selected album activation update
      return;
    }

    // Processes a callback for completing the activation/deactivation of an album.
    if (contents.callback_query && contents.callback_query.data.startsWith(`${BOT_ID}_${CONTINUE}`)) {
      log(['🎬 Callback Completion']); // Log the completion callback
      handleAlbumActivationEndCallback(contents); // Finalize the activation/deactivation process
      return;
    }

    // Handles the step for entering the album name during creation.
    if (contents.message && contents.message.chat.type == 'private' && getStep(contents.message.chat.id) == NEW_ALBUM_NAME_STEP) {
      log(['👣 Name Step Started']); // Log the initiation of the name step
      handleAlbumNameStep(contents); // Process the step for entering the album name
      return;
    }

    // Handles the step for entering the folder's URL during album creation.
    if (contents.message && contents.message.chat.type == 'private' && getStep(contents.message.chat.id) == NEW_ALBUM_FOLDER_STEP) {
      log(['👣 Folder Step Started']); // Log the initiation of the folder step
      handleFolderStep(contents); // Process the step for entering the folder URL
      return;
    }
  } catch (error) {
    log(['⛔ Error', error]);
    throw error;
  }
}

function handlePhoto(contents, isCompressed) {
  /* This function processes messages containing photo files. 
  It retrieves the active album, checks if the album exists, 
  and uploads the photo to the corresponding album.
  Parameters:
  - contents: an object containing the message data.
  - isCompressed: a boolean indicating if the photo file is compressed or not.*/

  const album = getActiveAlbum(contents.message.chat.id); // Retrieve the active album for the chat

  if (album.length > 0) { // Check if an active album exists
    const albumUrl = `${FOLDERS_URL_PREFIX}${album[ALBUMS_SHEET.DRIVE_ID_COL - 1]}`; // Construct the album URL
    let imageBlob;

    try {
      // Get the image blob based on whether the photo is compressed or not
      imageBlob = isCompressed ? getImageBlob(contents.message.photo) : getImageBlob(contents.message.document);
    } catch (error) {
      // Inform the user if there was an error retrieving the image
      reply(contents.message.chat.id, contents.message.message_id,
        `⛔ No se pudo agregar este archivo al álbum <a href="${albumUrl}">${album[ALBUMS_SHEET.NAME_COL - 1]}</a> (tamaño máximo permitido: ${FILE_MAX_SIZE / 1024 / 1024} Mb).`);
      return; // Exit the function since the image couldn't be processed
    }

    // Calculate the size of the image in MB
    const sizeInMB = (imageBlob.getBytes().length / (1024 * 1024)).toFixed(2);
    // Generate a file name based on whether the image is compressed
    const name = isCompressed ? `${(contents.message.from.username || 'no_name')}.jpg` : contents.message.document.file_name;
    const fileName = `${generateTimestamp()}_${name}`; // Construct the file name with timestamp

    // Upload the image file to the album
    const file = uploadFile(fileName, album, imageBlob, 'image');
    const fileUrl = `${FILE_URL_PREFIX}${file.getId()}/view`; // Construct the URL for the uploaded image

    // Prepare the reply message with the uploaded image details
    const replyText = `📁 Foto <a href="${fileUrl}">${file.getName()}</a> (${sizeInMB}MB) agregada al álbum <a href="${albumUrl}">${album[ALBUMS_SHEET.NAME_COL - 1]}</a>.`;

    // Reply to the user with the confirmation message and a button to delete the image
    reply(contents.message.chat.id, contents.message.message_id, replyText,
      [[{ 'text': DELETE_TEXT, 'callback_data': `${BOT_ID}_${DELETE_TEXT}_${contents.message.chat.id}` }]]
    );
  }
}

function handleVideo(contents, isCompressed) {
  /* This function processes messages containing video files. 
  It retrieves the active album, checks if the album exists, 
  and uploads the video to the corresponding album.
  Parameters:
  - contents: an object containing the message data.
  - isCompressed: a boolean indicating if the video file is compressed or not.*/

  const album = getActiveAlbum(contents.message.chat.id); // Retrieve the active album for the chat

  if (album.length > 0) { // Check if an active album exists
    const albumUrl = `${FOLDERS_URL_PREFIX}${album[ALBUMS_SHEET.DRIVE_ID_COL - 1]}`; // Construct the album URL
    let videoBlob;

    try {
      // Get the video blob based on whether the video is compressed or not
      videoBlob = isCompressed ? getVideoBlob(contents.message.video) : getVideoBlob(contents.message.document);
    } catch (error) {
      // Inform the user if there was an error retrieving the video
      reply(contents.message.chat.id, contents.message.message_id,
        `⛔ No se pudo agregar este archivo al álbum <a href="${albumUrl}">${album[ALBUMS_SHEET.NAME_COL - 1]}</a> (tamaño máximo permitido: ${FILE_MAX_SIZE / 1024 / 1024} Mb).`);
      return; // Exit the function since the video couldn't be processed
    }

    // Calculate the size of the video in MB
    const sizeInMB = (videoBlob.getBytes().length / (1024 * 1024)).toFixed(2);
    // Generate a file name based on whether the video is compressed
    const fileName = isCompressed ? `${generateTimestamp()}_${(contents.message.from.username || 'no_name')}.mp4` : `${generateTimestamp()}_${contents.message.document.file_name}`;

    // Upload the video file to the album
    const file = uploadFile(fileName, album, videoBlob, 'video');
    const fileUrl = `${FILE_URL_PREFIX}${file.getId()}/view`; // Construct the URL for the uploaded video

    // Prepare the reply message with the uploaded video details
    const replyText = `📹 Video <a href="${fileUrl}">${file.getName()}</a> (${sizeInMB}MB) agregado al álbum <a href="${albumUrl}">${album[ALBUMS_SHEET.NAME_COL - 1]}</a>.`;

    // Reply to the user with the confirmation message and a button to delete the video
    reply(contents.message.chat.id, contents.message.message_id, replyText,
      [[{ 'text': DELETE_TEXT, 'callback_data': `${BOT_ID}_${DELETE_TEXT}_${contents.message.chat.id}` }]]
    );
  }
}

function handleDeleteFileCallback(contents) {
  /* This function processes the callback for deleting a file from an album.
  It verifies the callback data, deletes the specified file, and sends notifications
  to the user regarding the deletion.
  Parameters: an object containing the callback query data.*/

  const callback = contents.callback_query; // Extract the callback query information
  const groupId = callback.data.split('_')[2]; // Extract the group ID from the callback data
  const fileAndAlbum = parseFileAndAlbum(callback.message.text); // Parse the file and album info from the message
  const folderId = getFolderId(fileAndAlbum.albumName, groupId); // Retrieve the folder ID for the album

  // Delete the specified file from the album
  deleteFileByName(folderId, fileAndAlbum.fileName);

  // Delete the callback message
  deleteMessage(callback.message.chat.id, callback.message.message_id);

  // Notify the user about the deletion of the file from the album
  sendMessage(callback.message.chat.id,
    `<i>🗑 @${callback.from.username} ha quitado una foto o un video del álbum <a href='${FOLDERS_URL_PREFIX}${folderId}'>${fileAndAlbum.albumName}</a>.</i>`
  );

  // Respond to the callback query indicating the file was successfully deleted
  answerCallbackWithToast(contents.callback_query.id,
    `👍 Archivo \"${fileAndAlbum.fileName}\" eliminado correctamente del álbum \"${fileAndAlbum.albumName}\"`
  );
}

function handleAlbumsCommand(contents) {
  /* This function processes the /albums command.
  It checks if the command is issued in a valid chat type and 
  sends back the appropriate response based on the availability of albums.
  Parameters: an object containing the message data.*/

  const chatType = contents.message.chat.type; // Retrieve the chat type
  if (chatType !== 'group' && chatType !== 'supergroup') {
    // Notify the user that the command can only be used in groups
    reply(contents.message.chat.id, contents.message.message_id, `⛔ El comando ${COMMANDS[0]} solo puede ser usado en grupos.`);
  } else {
    const groupId = contents.message.chat.id; // Get the group ID
    const groupName = getGroupName(groupId);
    const userId = contents.message.from.id; // Get the user's ID
    const username = contents.message.from.username || 'no_username'; // Get the username of the user
    const albums = getGroupAlbums(groupId); // Retrieve all albums for the group
    const inlineKeyboardAlbums = generateAlbumsInlineKeyboard(albums, groupId); // Generate the inline keyboard for the albums

    try {
      // Send the appropriate message based on the number of albums
      const messageText = (albums.length == 0) ? `📚 El grupo <b>${groupName}</b> no tiene álbums todavía.` :
        `📚 Álbums del grupo <b>${groupName}</b>:\n( ✅ = activo)`
      sendMessage(userId, messageText, inlineKeyboardAlbums);

      // Inform the user that further interaction will occur in private
      reply(groupId, contents.message.message_id, `<i>🔇 OK @${username}, seguimos por privado <a href="${BOT_URL}">aquí</a>.</i>`);
    } catch (error) { // Detect when user did not interact with the bot previously

      // Inform the user that a bot start is needed first
      reply(groupId, contents.message.message_id, `<i>⚠️ OK @${username}: para usar el comando /albums por primera vez vas a necesitar inicar el bot con <b>start</b> <a href="${BOT_URL}">aquí</a></i>, y luego podrás usar el comando /albums en este grupo.`);
    }
  }
}

function handleConfigAlbumsCallback(contents) {
  /* This function handles the callback for configuring albums within a group.
  It retrieves the group ID, fetches the available albums, and presents the user
  with options for album management.
  Parameters: an object containing the callback query data.*/

  const callback = contents.callback_query; // Extract the callback query information
  const groupId = callback.data.split('_')[2]; // Extract the group ID from the callback data
  const albums = getGroupAlbums(groupId); // Retrieve all albums for the group
  const inlineKeyboard = [[{ text: NEW_ALBUM, callback_data: `${BOT_ID}_${NEW_ALBUM}_${groupId}` }]]; // Initialize the keyboard with the new album option
  const groupName = getGroupName(groupId); // Get the name of the group

  // Add options for deletion and activation if albums are available
  if (albums.length > 0) {
    inlineKeyboard.push([{ text: DELETE_ALBUM, callback_data: `${BOT_ID}_${DELETE_ALBUM}_${groupId}` }]);
    inlineKeyboard.push([{ text: ACTIVATE_ALBUM, callback_data: `${BOT_ID}_${ACTIVATE_ALBUM}_${groupId}` }]);
  }

  // Add the cancel option to the keyboard
  inlineKeyboard.push([{ text: CANCEL, callback_data: `${BOT_ID}_${CANCEL}` }]);

  // Edit the message to display the album management options
  editMessage(callback.message.chat.id, callback.message.message_id,
    `⚙️ Administración de álbums del grupo <b>${groupName}</b>. Elegí una de las opciones:`,
    inlineKeyboard
  );
}

function handleNewAlbumCallback(contents) {
  /* This function handles the callback for starting a new album creation process.
  It retrieves the chat ID and group information, deletes the previous message,
  and prompts the user for the album's name.
  Parameters: an object containing the callback query data.*/

  const callback = contents.callback_query; // Extract the callback query information
  const chatId = callback.message.chat.id; // Retrieve the ID of the chat
  const username = callback.message.chat.username; // Get the username of the person initiating the album creation
  const groupId = callback.data.split('_')[2]; // Extract the group ID from the callback data
  const groupName = getGroupName(groupId); // Get the name of the group

  deleteMessage(chatId, callback.message.message_id); // Delete the callback message
  newAlbum(chatId, groupId, groupName); // Initiate the new album creation process

  log(['➕ Album creation initiated', `@${username} started the creation of a new album for group @${groupName}`]); // Log the initiation

  // Send a message prompt to the user for the new album name
  sendMessage(chatId, `🤟 Empezamos con la creación de un nuevo álbum para el grupo <b>${groupName}</b>...\n\n` +
    '❓ ¿Cómo se va a llamar el nuevo álbum?');
}

function handleAlbumNameStep(contents) {
  /* This function processes the step where the user specifies the name of the new album.
  It checks for existing album names in the group and updates the name accordingly.
  Parameters: an object containing the message data.*/

  const chatId = contents.message.chat.id; // Retrieve the ID of the chat

  // Check if an album with the same name already exists in the group
  if (alreadyExists(getGroupId(chatId), contents.message.text)) {
    // Inform the user if an album with the same name already exists
    sendMessage(chatId, `⛔ Ya hay un álbum con el nombre <b>${contents.message.text}</b> en el grupo, por favor elegir otro nombre.\n\n❓ ¿Cómo se va a llamar el nuevo álbum?`);
  } else {
    setAlbumName(chatId, contents.message.text); // Set the new album name for the user
    setStep(chatId, NEW_ALBUM_FOLDER_STEP); // Update the current step for the user
    log(['✔️ Album name defined', contents.message.text]); // Log the new album name

    // Prompt the user to provide the URL of the folder for the album
    sendMessage(chatId, `✔️ OK con el nombre de álbum: <b>${contents.message.text}</b>\n\n` +
      '📂 Ahora pega la <b>URL de la carpeta en Google Drive</b> donde se subirán las fotos y videos.\n\n' +
      '⚠️ Es necesario compartir una carpeta con <b>permisos de edición</b>.');
  }
}

function handleFolderStep(contents) {
  /* This function processes the step where the user provides the URL of the folder for 
  the new album. It checks the folder's permissions and sends appropriate messages 
  back to the user based on the provided input.
  Parameters: an object containing the message data.*/

  const folderIdExtracted = extractFolderId(contents.message.text); // Extract the folder ID from the user's message
  const chatId = contents.message.chat.id; // Retrieve the ID of the chat

  // Check if a valid folder ID was extracted
  if (folderIdExtracted.found) {
    const folderId = folderIdExtracted.folderId; // Get the extracted folder ID
    log(['🔎 Checking bot access', contents.message.text, folderId]); // Log the folder checking

    // Check permissions for the specified folder
    if (checkFolderPermissions(folderId)) {
      setFolderId(chatId, folderId); // Set the folder ID for the user
      log(['📂 Folder defined', folderId]); // Log the folder definition

      const groupName = getGroupName(getGroupId(chatId));
      const inlineKeyboard = [[
        { text: CANCEL, callback_data: `${BOT_ID}_${CANCEL}` },
        { text: CONFIRMATION, callback_data: `${BOT_ID}_${CONFIRM_NEW}` }
      ]]; // Prepare buttons for user confirmation

      // Send a confirmation message to the user about the new album creation
      sendMessage(chatId, `⚠️ ¿Confirmar la creación del álbum <a href="${FOLDERS_URL_PREFIX}${folderId}">${getAlbumName(chatId)}</a> para el grupo <b>${groupName}</b>?`, inlineKeyboard);
    } else {
      // Inform the user about insufficient permissions for the folder
      sendMessage(chatId, `⛔ No tengo permisos suficientes en <a href="${contents.message.text}">esta carpeta</a>.\n\n` +
        '⚠️ Es necesario compartir una carpeta con <b>permisos de edición</b>.\n\n' +
        '📂 Por favor pega la <b>URL de la carpeta en Google Drive</b> donde se subirán las fotos y videos.\n\n');
    }
  } else {
    // Inform the user that the folder is not valid
    sendMessage(chatId, `⛔ ${contents.message.text} no es una carpeta válida.\n\n` +
      '⚠️ Es necesario compartir una carpeta con <b>permisos de edición</b>.\n\n' +
      '📂 Por favor pega la <b>URL de la carpeta en Google Drive</b> donde se subirán las fotos y videos.\n\n');
  }
}

function handleConfirmNewAlbumCallback(contents) {
  /* This function handles the callback confirming the creation of a new album.
  It creates the album, deletes any user transactions, and notifies the group
  and the user about the successful creation of the album.
  Parameters: an object containing the callback query data.*/

  const chatId = contents.callback_query.message.chat.id; // Retrieve the ID of the chat
  const album = createAlbum(chatId); // Create a new album and store its information
  const groupName = getGroupName(album.groupId);
  deleteUserTxs(chatId); // Clear any existing user transactions
  const albums = getGroupAlbums(album.groupId); // Retrieve all albums for the group

  // Edit the callback message to confirm the album has been created
  editMessage(chatId, contents.callback_query.message.message_id,
    `📂 El álbúm <a href="${FOLDERS_URL_PREFIX}${album.folderId}">${album.albumName}</a> fue creado correctamente` +
    ` para el grupo <b>${groupName}</b>.`
  );

  // Send a message to the user with the list of albums
  sendMessage(chatId, `📚 Álbums del grupo <b>${groupName}</b>:\n( ✅ = activo)`,
    generateAlbumsInlineKeyboard(albums, album.groupId));
}

function handleDeleteAlbumCallback(contents) {
  /* This function handles the callback for choosing an album to delete.
  It updates the message to prompt the user to select an album for deletion 
  and presents the inline keyboard with the list of albums.
  Parameters: an object containing the callback query data.*/

  const callback = contents.callback_query; // Extract the callback query information
  const chatId = callback.message.chat.id; // Retrieve the ID of the chat
  const groupId = callback.data.split('_')[2]; // Extract the group ID from the callback data
  const groupName = getGroupName(groupId);

  // Edit the message to ask the user to choose an album to delete
  editMessage(chatId, callback.message.message_id,
    `📂 Elegí el álbum a eliminar. Una vez eliminado, no aparecerá más en el grupo <b>${groupName}</b>.\n\n` +
    '⚠️ No se eliminarán ni la carpeta correspondiente en Google Drive ni sus archivos.',
    generateAlbumsListInlineKeyboard(getGroupAlbums(groupId), groupId, DELETE_KEY, [CANCEL])
  );
}

function handleDeleteSelectedAlbumCallback(contents) {
  /* This function processes the callback for confirming the deletion of the selected album.
  It constructs a confirmation message to be sent to the user.
  Parameters: an object containing the callback query data.*/

  const callback = contents.callback_query; // Extract the callback query information
  const chatId = callback.message.chat.id; // Retrieve the ID of the chat
  const groupId = callback.data.split('_')[2]; // Extract the group ID from the callback data
  const groupName = getGroupName(groupId);
  const albumName = callback.data.split('_')[3]; // Extract the album name from the callback data

  // Edit the callback message to ask for confirmation to delete the album
  editMessage(chatId, callback.message.message_id,
    `⚠️ ¿Confirmar la eliminación del álbum <a href="${FOLDERS_URL_PREFIX}${getFolderId(albumName, groupId)}">${albumName}</a> del grupo <b>${groupName}</b> (no se eliminarán ni la carpeta correspondiente en Google Drive ni sus archivos)?`,
    [[
      { text: CANCEL, callback_data: `${BOT_ID}_${CANCEL}` },
      { text: CONFIRMATION, callback_data: `${BOT_ID}_${CONFIRMATION}_${groupId}_${albumName}` }
    ]]
  );
}

function handleDeleteAlbumConfirmationCallback(contents) {
  /* This function handles the callback confirming the deletion of an album.
  It deletes the specified album and sends messages to notify the group and the user.
  Parameters: an object containing the callback query data.*/

  const callback = contents.callback_query; // Extract the callback query information
  const chatId = callback.message.chat.id; // Retrieve the ID of the chat
  const groupId = callback.data.split('_')[2]; // Extract the group ID from the callback data
  const albumName = callback.data.split('_')[3]; // Extract the album name from the callback data
  const groupName = getGroupName(groupId);
  const username = callback.from.username || 'no_username'; // Get the username of the person who initiated the deletion

  // Delete the specified album from the group
  deleteAlbum(groupId, albumName);
  log(['🗑 Album deleted', albumName]); // Log the deletion for debugging purposes (in English)

  // Edit the callback message to confirm the album has been deleted
  editMessage(chatId, callback.message.message_id,
    `🗑 El álbum <a href="${FOLDERS_URL_PREFIX}${getFolderId(albumName, groupId)}">${albumName}</a> ha sido eliminado correctamente` +
    ` del grupo <b>${groupName}</b>.`
  );

  // Send a message to the user with the list of albums
  const albums = getGroupAlbums(groupId);
  sendMessage(chatId, `📚 Álbums del grupo <b>${groupName}</b>:\n( ✅ = activo)`, generateAlbumsInlineKeyboard(albums, groupId));

  // Notify the group about the album deletion
  sendMessage(groupId, `🗑 <i>@${username} eliminó el álbum <a href="${FOLDERS_URL_PREFIX}${getFolderId(albumName, groupId)}">${albumName}</a> del grupo.</i>`);
}

function handleAlbumActivationCallback(contents) {
  /* This function handles the callback for activating or deactivating an album.
  It updates the inline keyboard to let the user choose an album to activate or deactivate.
  Parameters:
  - contents: an object containing the callback query data.*/

  const callback = contents.callback_query; // Extract the callback query information
  const chatId = callback.message.chat.id; // Retrieve the ID of the chat
  const groupId = callback.data.split('_')[2]; // Extract the group ID from the callback data

  log(['🎬 Editing active album in progress']); // Log the editing action

  // Update the message with the inline keyboard for album activation
  editMessage(chatId, callback.message.message_id,
    `🎬 Cliquea sobre un álbum para activar o desactivarlo, o <b>${CONTINUE}</b> para terminar.\n\n`,
    generateAlbumsListInlineKeyboard(getGroupAlbums(groupId), groupId, ACTIVATE_KEY, [CONTINUE, CANCEL])
  );
}

function handleAlbumActivationUpdateCallback(contents) {
  /* This function processes the callback to update the activation or deactivation 
  state of an album. It modifies the inline keyboard and sends notifications to the user.
  Parameters: an object containing the callback query data.*/

  const callback = contents.callback_query; // Extract the callback query info
  const callbackData = callback.data; // Get the callback data for the clicked button
  const inlineKeyboard = callback.message.reply_markup.inline_keyboard; // Retrieve the inline keyboard
  let clickedButton; // Variable to hold the clicked button
  let noActiveAlbum = false; // Flag for tracking if there are no active albums

  // Identify the clicked button in the inline keyboard
  inlineKeyboard.flat().forEach(button => {
    if (button.callback_data == callbackData) {
      clickedButton = button; // Set the clicked button if found
    }
  });

  // If a button was clicked, update the button's state
  if (clickedButton) {
    if (clickedButton.text.endsWith('✅')) {
      clickedButton.text = clickedButton.text.slice(0, -2); // Remove checkmark if active
      noActiveAlbum = true; // Set flag indicating no active album
    } else {
      clickedButton.text += ' ✅'; // Add checkmark to indicate activation
      inlineKeyboard.flat().forEach(button => {
        // Remove checkmark from any other buttons
        if (button.callback_data !== callbackData && button.text.endsWith('✅')) {
          button.text = button.text.slice(0, -2);
        }
      });
    }
  }

  // Update the message with the modified inline keyboard
  editMessage(callback.message.chat.id, callback.message.message_id,
    `🎬 Cliquea sobre un álbum para activar o desactivarlo, o <b>${CONTINUE}</b> para terminar.\n\n`, inlineKeyboard);

  // Notify the user if there are no active albums
  if (noActiveAlbum) {
    answerCallbackWithToast(contents.callback_query.id, '⚠️ Si terminas ahora, no quedará ningún álbum activo en el grupo.');
  }
}

function handleAlbumActivationUpdateCallback(contents) {
/* This function processes the callback to update the activation or deactivation 
state of an album. It modifies the inline keyboard and sends notifications to the user.
Parameters: an object containing the callback query data.*/

  const callback = contents.callback_query; // Extract the callback query info
  const callbackData = callback.data; // Get the callback data for the clicked button
  const inlineKeyboard = callback.message.reply_markup.inline_keyboard; // Retrieve the inline keyboard

  // Call function to update state of buttons when clicked
  const noActiveAlbum = updateClickedButtonState(inlineKeyboard, callbackData);

  // Update the message with the modified inline keyboard
  editMessage(callback.message.chat.id, callback.message.message_id,
    `🎬 Cliquea sobre un álbum para activar o desactivarlo, o <b>${CONTINUE}</b> para terminar.\n\n`, inlineKeyboard);

  // Notify the user if there are no active albums
  if (noActiveAlbum) {
    answerCallbackWithToast(contents.callback_query.id, '⚠️ Si terminas ahora, no quedará ningún álbum activo en el grupo.');
  }
}

function handleAlbumActivationEndCallback(contents) {
  /* This function processes the callback to finalize the activation or deactivation 
  of an album. It updates the album's status and sends messages to notify the group. 
  Parameters: an object containing the callback query data.*/

  const callback = contents.callback_query; // Extract the callback query info
  const chatId = callback.message.chat.id; // Retrieve the ID of the chat
  let groupId = null;
  let previousActiveAlbum;

  // Process each button in the inline keyboard to update album statuses
  callback.message.reply_markup.inline_keyboard.flat().forEach(button => {
    const originalText = button.text;
    if (originalText !== CONTINUE && originalText !== CANCEL) {
      if (!groupId) {
        groupId = button.callback_data.split('_')[2]; // Extract group ID from the callback data
        previousActiveAlbum = getActiveAlbum(groupId); // Get the currently active album
      }
      const albumName = originalText.replace(/ ✅/g, ''); // Remove the checkmark from the album name
      setActive(groupId, albumName, originalText.endsWith('✅')); // Set the album status
    }
  });

  log(['🎬 Album activation updated']); // Log the update for debugging purposes

  const currentActiveAlbum = getActiveAlbum(groupId); // Check the current active album
  const groupName = getGroupName(groupId);

  // Construct and send the appropriate notification based on the activation/deactivation
  const isActivating = !!currentActiveAlbum.length;
  const currentAlbumName = isActivating ? currentActiveAlbum[ALBUMS_SHEET.NAME_COL - 1] : previousActiveAlbum[ALBUMS_SHEET.NAME_COL - 1];

  const notificationText = isActivating
    ? `📂 <i>@${callback.from.username} activó el álbum <a href="${FOLDERS_URL_PREFIX}${getFolderId(currentAlbumName, groupId)}">${currentAlbumName}</a>.\n` +
    '🤖 A partir de ahora, estaré subiendo automaticamente a este álbum las fotos y videos que se envían al grupo.\n</i>'
    : `📂 <i>@${callback.from.username} desactivó el álbum <a href="${FOLDERS_URL_PREFIX}${getFolderId(previousActiveAlbum[ALBUMS_SHEET.NAME_COL - 1], groupId)}">${previousActiveAlbum[ALBUMS_SHEET.NAME_COL - 1]}</a>.\n` +
    '🤖 A partir de ahora, al no haber álbum activo, no estaré subiendo las fotos y videos que se envían al grupo.\n</i>'

  sendMessage(groupId, notificationText + '<i>🔎 Podes consultar y configurar los álbums del grupo con el comando /albums.</i>'); // Send the notification message

  // Edit the message to confirm the active state
  const editText = isActivating
    ? `📂 Quedó activo el álbum <a href="${FOLDERS_URL_PREFIX}${getFolderId(currentAlbumName, groupId)}">${currentAlbumName}</a> ` +
    `para el grupo <b>${groupName}</b>.`
    : `📂 No quedó ningún álbum activo para el grupo <b>${groupName}</b>.`;

  editMessage(chatId, callback.message.message_id, editText); // Edit confirmation message

  // Send a message to the user with the list of albums
  const albums = getGroupAlbums(groupId);
  sendMessage(chatId, `📚 Álbums del grupo <b>${groupName}</b>:\n( ✅ = activo)`, generateAlbumsInlineKeyboard(albums, groupId));
}
