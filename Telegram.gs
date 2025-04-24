function sendMessage(chatId, text, inlineKeyboard = null) {
  /* This function sends an HTTP request to the Telegram API to send a message 
  to the specified chat and logs the action.
  Parameters:
  - chatId: a number representing the ID of the chat to which the message will be sent.
  - text: a string representing the message to be sent.
  - inlineKeyboard: an optional parameter that, if provided, will attach an inline keyboard to the message.
  Returns: the message ID if sent successfully; throws an error if the request fails.*/

  // Construct the payload for the API request
  const payload = {
    chat_id: String(chatId),
    text: truncateString(text, MESSAGE_MAX_SIZE),
    parse_mode: 'HTML',
  };

  if (inlineKeyboard) {
    // If an inline keyboard is provided, add it to the payload
    payload.reply_markup = { inline_keyboard: inlineKeyboard };
  }

  // Send the message via the Telegram API
  const response = telegramApiRequest('sendMessage', payload);

  // Log the successful sending of the message
  log(['⤴️ Message sent', truncateString(text, MESSAGE_MAX_SIZE)]);

  return response.result.message_id; // Return the message ID
}

function reply(chatId, replyId, text, inlineKeyboard = null) {
  /* This function sends an HTTP request to the Telegram API to send a message 
  and optionally includes an inline keyboard for user interaction.
  Parameters:
  - chatId: a number representing the ID of the chat to which the message will be sent.
  - replyId: a number representing the ID of the message to which this is a reply.
  - text: a string representing the message to be sent.
  - inlineKeyboard: an optional parameter that, if provided, will attach an inline keyboard to the message.
  Returns: nothing; throws an error if the request fails.*/

  // Construct the payload for the API request
  const payload = {
    chat_id: String(chatId),
    text: truncateString(`<i>${text}</i>`, MESSAGE_MAX_SIZE),
    parse_mode: 'HTML',
    reply_to_message_id: String(replyId),
  };

  if (inlineKeyboard) {
    // If an inline keyboard is provided, add it to the payload
    payload.reply_markup = { inline_keyboard: inlineKeyboard };
  }

  // Send the message via the Telegram API
  telegramApiRequest('sendMessage', payload);

  // Log the successful sending of the reply message
  log(['⤴️ Reply sent', truncateString(text, MESSAGE_MAX_SIZE)]);
}

function editMessage(chatId, messageId, newText, newInlineKeyboard = null) {
  /* This function sends a request to the Telegram API to update an existing message
  with new text and an optional inline keyboard.
  Parameters:
  - chatId: a number representing the ID of the chat where the message is located.
  - messageId: a number representing the ID of the message to be edited.
  - newText: a string representing the new text to replace the original message text.
  - newInlineKeyboard: an optional parameter for the new inline keyboard to attach to the message.
  Returns: nothing; throws an error if the request fails. */

  // Construct the payload for the API request
  const payload = {
    chat_id: String(chatId),
    message_id: String(messageId),
    text: truncateString(`<i>${newText}</i>`, MESSAGE_MAX_SIZE),
    parse_mode: 'HTML',
  };

  if (newInlineKeyboard) {
    // If an inline keyboard is provided, add it to the payload
    payload.reply_markup = { inline_keyboard: newInlineKeyboard };
  } else {
    payload.reply_markup = { inline_keyboard: [[]] };
  }

  // Send the message via the Telegram API
  telegramApiRequest('editMessageText', payload);
  // Send the request to edit the message text and inline keyboard

  // Log the successful editing of the message
  log(['✍️ Message edited', truncateString(newText, MESSAGE_MAX_SIZE)]);
}

function answerCallbackWithToast(callbackQueryId, text) {
  /* This function sends a response to a user's callback query, 
  allowing the bot to provide feedback without taking up chat space.
  Parameters:
  - callbackQueryId: a number representing the unique identifier for the callback query.
  - text: a string representing the message to be displayed as a toast notification.
  Returns: nothing; throws an error if the request fails.*/

  try {
    // Send a response to the callback query with the specified toast message
    telegramApiRequest('answerCallbackQuery', {
      callback_query_id: String(callbackQueryId),
      text: truncateString(text, TOAST_MAX_SIZE),
      show_alert: false // Set to false to display as a toast instead of a full alert
    });

    // Log the successful sending of the toast message
    log(['🍞 Toast sent', truncateString(text, TOAST_MAX_SIZE)]);
  } catch (error) {
    // Throw an error with context if the request fails
    throw new Error(`[answerCallbackWithToast(callbackQueryId=${callbackQueryId}, text=${text})] Could not send toast: ${error.message}`);
  }
}

function deleteMessage(chatId, messageId) {
  /* This function sends a request to the Telegram API to delete a specific message 
  identified by its messageId in the specified chat.
  Parameters:
  - chatId: a number representing the unique identifier of the Telegram group.
  - messageId: a number representing the ID of the message to be deleted.
  Returns: nothing; throws an error if the request fails.*/

  // Send a request to the Telegram API to delete the specified message
  telegramApiRequest('deleteMessage', { chat_id: String(chatId), message_id: String(messageId) });

  // Log the successful deletion of the message
  log(['❌ Message deleted']);
}

function getImageBlob(image) {
  /* This function determines the file ID based on the provided image format 
  and fetches the corresponding blob data.
  Parameters: an array or object representing the photo data containing file_id.
  Returns: a Blob object representing the image data; 
  throws an error if the format is unrecognized or if the request fails.*/

  try {
    let fileId;
    // Determine the file ID based on the format of the image
    if (Array.isArray(image)) {
      // Case: photo (compressed)
      fileId = image[image.length - 1].file_id;
    } else if (image.file_id) {
      // Case: document (uncompressed)
      fileId = image.file_id;
    } else {
      throw new Error(`[getImageBlob(image)] Unrecognized image format.`);
    }

    // Fetch the file from Telegram using the file ID
    const response = UrlFetchApp.fetch(`${TELEGRAM_URL}/getFile?file_id=${fileId}`);
    const imageUrl = `${FILE_BOT_PREFIX}${BOT_TOKEN}/${JSON.parse(response.getContentText()).result.file_path}`;

    // Fetch and return the blob data for the image
    return UrlFetchApp.fetch(imageUrl).getBlob();
  } catch (error) {
    // Throw an error with context if the request fails
    throw new Error(`[getImageBlob(image)] ${error.message}`);
  }
}

function getVideoBlob(document) {
  /* This function fetches the video blob using the provided document's file_id.
  Parameters: an object representing the video data containing file_id.
  Returns: a Blob object representing the video data; 
  throws an error if the request fails.*/

  try {
    const fileId = document.file_id; // Retrieve the file ID from the document
    // Fetch the file information from Telegram using the file ID
    const fileInfoResponse = UrlFetchApp.fetch(`${TELEGRAM_URL}/getFile?file_id=${fileId}`);
    const fileInfo = JSON.parse(fileInfoResponse.getContentText());
    const videoUrl = `${FILE_BOT_PREFIX}${BOT_TOKEN}/${fileInfo.result.file_path}`;

    // Fetch and return the blob data for the video
    return UrlFetchApp.fetch(videoUrl).getBlob();
  } catch (error) {
    // Throw an error with context if the request fails
    throw new Error(`[getVideoBlob(document)] ${error.message}`);
  }
}

function getGroupName(groupId) {
  /* This function calls the Telegram API to obtain the group's namelink.
  Parameters: a number representing the unique identifier of the Telegram group.
  Returns: a string with the group name; 
  throws an error if the request fails or if the response indicates an error.*/

  try {
    // Call the Telegram API to get group information
    const response = telegramApiRequest('getChat', { chat_id: String(groupId) });

    // Return the group name
    return response.result.title;

  } catch (error) {
    // Throw an error with context if the request fails
    throw new Error(`[getGroupName(groupId=${groupId})] Error retrieving group name: ${error.message}`);
  }
}

function telegramApiRequest(method, payload) {
  /* This function sends an HTTP POST request to the Telegram API and processes the response.
  Parameters:
  - method: a string representing the Telegram API method to call (e.g., 'sendMessage').
  - payload: an object containing the parameters to be sent with the method call.
  Returns: an object containing the response data from the Telegram API; 
  throws an error if the request fails or if the response indicates an error.*/

  try {
    // Make the HTTP POST request to the Telegram API
    const response = UrlFetchApp.fetch(`${TELEGRAM_URL}/`, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ method: method, ...payload }) // Construct the payload
    });

    // Parse the response text into a JavaScript object
    const responseData = JSON.parse(response.getContentText());

    // Check if the response indicates an error and log it
    if (!responseData.ok) {
      throw new Error(`[telegramApiRequest(method=${method}, payload)] Error in Telegram API - ${responseData.error_code}: ${responseData.description}`);
    }

    return responseData; // Return the response data
  } catch (error) {
    throw new Error(`[telegramApiRequest(method=${method}, payload)] Could not make request to Telegram: ${error.message}`);
  }
}

function generateAlbumsInlineKeyboard(albums, groupId) {
  /* Generates an inline keyboard menu for the /albums command.
  This function constructs an inline keyboard that displays the available albums,
  allows users to interact with them, and provides configuration options.
  Parameters:
  - albums: an array of album objects containing album information.
  - groupId: a number representing the unique identifier of the Telegram group.
  Returns: an array of rows, each containing button objects for the inline keyboard.*/

  const inlineKeyboard = []; // Initialize the array to hold the keyboard rows

  // Create rows for the albums if any are available
  if (albums.length > 0) {
    for (let i = 0; i < albums.length; i += GROUP_SIZE_ALBUMS) {
      const row = []; // Initialize a new row
      for (let j = 0; j < GROUP_SIZE_ALBUMS && (i + j) < albums.length; j++) {
        // Determine if the album is active and add a checkmark if true
        const selected = (albums[i + j][ALBUMS_SHEET.ACTIVE_COL - 1]) ? ' ✅' : '';

        // Push button object for the album into the row
        row.push({
          text: `${albums[i + j][ALBUMS_SHEET.NAME_COL - 1]}${selected}`, // Album name with checkmark
          callback_data: `${BOT_ID}_ALBUM`, // Callback data for album handling
          url: `${FOLDERS_URL_PREFIX}${albums[i + j][ALBUMS_SHEET.DRIVE_ID_COL - 1]}` // URL for direct access to the album
        });
      }
      inlineKeyboard.push(row); // Add the completed row of buttons to the inline keyboard
    }
  }

  // Push the configuration and cancel options to the inline keyboard
  inlineKeyboard.push([
    { text: CONFIG_ALBUMS, callback_data: `${BOT_ID}_${CONFIG_ALBUMS}_${groupId}` },
    { text: CANCEL, callback_data: `${BOT_ID}_${CANCEL}` }
  ]);

  return inlineKeyboard; // Return the constructed inline keyboard
}

function generateAlbumsListInlineKeyboard(albums, groupId, callbackKey, finalActions) {
  /* This function constructs an inline keyboard based on the provided albums 
  and allows for additional actions to be added at the bottom.
  Parameters:
  - albums: an array of album objects containing album information.
  - groupId: a number representing the unique identifier of the Telegram group.
  - callbackKey: a number used to define the callback data for interaction with the buttons.
  - finalActions: an array of strings representing additional action buttons to be added at the end.
  Returns: an array of rows, each containing button objects for the inline keyboard.*/

  const inlineKeyboard = []; // Initialize the array to hold the keyboard rows

  // Create rows for the albums
  for (let i = 0; i < albums.length; i += GROUP_SIZE_ALBUMS) {
    const row = []; // Initialize a new row
    for (let j = 0; j < GROUP_SIZE_ALBUMS && (i + j) < albums.length; j++) {
      // Determine if the album is active and add a checkmark if true
      const selected = (albums[i + j][ALBUMS_SHEET.ACTIVE_COL - 1]) ? ' ✅' : '';

      // Push button object for the album into the row
      row.push({
        text: `${albums[i + j][ALBUMS_SHEET.NAME_COL - 1]}${selected}`, // Album name with checkmark
        callback_data: `${BOT_ID}_${callbackKey}_${groupId}_${albums[i + j][ALBUMS_SHEET.NAME_COL - 1]}` // Unique identifier for callback
      });
    }
    inlineKeyboard.push(row); // Add the complete row of buttons to the inline keyboard
  }

  // Create the final actions row
  const finalActionsLine = []; // Initialize an array for final action buttons
  finalActions.forEach(value => {
    // Create button object for each final action and push into finalActionsLine
    finalActionsLine.push({
      text: value,
      callback_data: `${BOT_ID}_${value}` // Unique identifier for the callback based on the action
    });
  });
  inlineKeyboard.push(finalActionsLine); // Add the row of final actions to the keyboard

  return inlineKeyboard; // Return the constructed inline keyboard
}


function updateClickedButtonState(inlineKeyboard, callbackData) {
  /**
   * This function updates the state of a clicked button within an inline keyboard.
   * It identifies the button that was clicked and modifies its text to reflect its new state,
   * including adding or removing a checkmark to indicate activation.
   * 
   * @param {Array} inlineKeyboard - The inline keyboard containing button objects.
   * @param {string} callbackData - The callback data corresponding to the clicked button.
   * 
   * @returns {Object} An object containing a boolean indicating 
   *                   whether there are no active albums (noActiveAlbum).
   */
  let clickedButton; // Variable to hold the clicked button.
  let noActiveAlbum = false; // Flag for tracking if there are no active albums.

  // Identify the clicked button in the inline keyboard.
  inlineKeyboard.flat().forEach(button => {
    if (button.callback_data === callbackData) {
      clickedButton = button; // Set the clicked button if found.
    }
  });

  // If a button was clicked, update its state.
  if (clickedButton) {
    // Check if the button is already marked as active.
    if (clickedButton.text.endsWith('✅')) {
      clickedButton.text = clickedButton.text.slice(0, -2); // Remove checkmark if active.
      noActiveAlbum = true; // Set flag indicating no active album.
    } else {
      clickedButton.text += ' ✅'; // Add checkmark to indicate activation.
      inlineKeyboard.flat().forEach(button => {
        // Remove checkmark from any other buttons.
        if (button.callback_data !== callbackData && button.text.endsWith('✅')) {
          button.text = button.text.slice(0, -2); // Remove the checkmark from other active buttons.
        }
      });
    }
  }

  // Return if there is an active album.
  return noActiveAlbum;
}
