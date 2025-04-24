// Cache for sheets to improve performance
const sheetsCache = {};

function getSheet(id, name) {
  /* This function checks if the sheet is already cached. If not, it opens the sheet 
  using its ID and retrieves the specific sheet by name.
  Parameters:
  - id: a string representing the ID of the Google Sheets document.
  - name: a string representing the name of the sheet to retrieve.
  Returns: the sheet object if found; throws an error if the sheet cannot be retrieved.*/

  // Check the cache for the sheet and load it if not cached
  const cacheKey = `${id}:${name}`;
  if (!sheetsCache[cacheKey]) {
    sheetsCache[cacheKey] = SpreadsheetApp.openById(id).getSheetByName(name);

    // Check if the sheet was retrieved successfully
    if (!sheetsCache[cacheKey]) {
      throw new Error(`[getSheet(id=${id}, name=${name})] Sheet not found.`);
    }
  }

  return sheetsCache[cacheKey]; // Return the sheet object from cache
}

function log(data) {
  /* This function appends a new row to the log sheet with the current date and the provided data.
  Parameters:  an array of data to log in the sheet.*/

  // Check if logging is enabled and then log the provided data
  if (LOG_SHEET.LOGGING) {
    getSheet(AOC_SHEETS_ID, LOG_SHEET.NAME).appendRow([new Date(), ...data]);
  }
}

function truncateString(inputString, size) {
  /* This function truncates a string to a specified maximum length.
  If the input string exceeds the maximum length, it returns the substring 
  from the start up to the specified length. If the string is shorter than 
  or equal to the maximum length, it returns the original string.
  Parameters:
  - inputString: a string that will be truncated.
  - size: a number indicating the maximum length of the returned string.
  Returns: the truncated string if the input string exceeds size; 
  the original string if it does not.*/

  // Return the truncated string or the original string based on its length
  return (inputString.length > size) ? inputString.substring(0, size) : inputString;
}

function parseFileAndAlbum(messageText) {
  /* This function retrieves the file name and album name from a given message text.
  Expected format: "Foto [fileName] ([size]) agregada al álbum [albumName]." 
  or "Video [fileName] ([size]) agregado al álbum [albumName]."
  Parameters: a string representing the message text.
  Returns: an object containing the file name and album name if matched; 
  throws an error if no match is found.*/

  // Regular expression to match the expected format in the message text
  const match = messageText.match(/(Foto|Video) (.+?) \([^)]+\) (agregada|agregado) al álbum (.+)\./);
  if (match) {
    const fileName = match[2];
    const albumName = match[4];
    return { fileName, albumName };  // Return an object with the file name and album name
  } else {
    throw new Error(`[parseFileAndAlbum(messageText=${messageText})] File and/or album not found in the text.`);
  }
}

function isImage(document) {
  /* This function checks if the provided document is an image.
  Parameters: a document object containing the mime_type property.
  Returns: true if the document is an image; false otherwise.*/

  const mime = document.mime_type;
  return mime && mime.startsWith('image/');  // Return true if it's an image, false otherwise
}

function isVideo(document) {
  /* This function checks if the provided document is a video.
  Parameters: a document object containing the mime_type property.
  Returns: true if the document is a video; false otherwise.*/

  const mime = document.mime_type;
  return mime && mime.startsWith('video/');  // Return true if it's a video, false otherwise
}

function generateTimestamp() {
  /* This function creates a formatted string based on the current date and time,
  in the format YYYYMMDD_HHMMSSms, which can be used to ensure unique filenames.
  Returns: a string representing the current timestamp in the specified format.*/

  // Create a new Date object to get the current date and time
  const now = new Date();

  // Extract components of the date and time
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');  // Month is 0-indexed, add 1
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');

  // Combine components into a timestamp string
  return `${year}${month}${day}_${hour}${minute}${second}${ms}`;
}
