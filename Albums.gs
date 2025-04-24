//_____________ Albums _____________

function getFolderId(albumName, groupId) {
  /* This function retrieves the folder ID based on the album name 
  and group ID. It reads all album data from the sheet and filters to find the match.
  Parameters:
  - albumName: a string representing the name of the album.
  - groupId: a string representing the ID of the group.
  Returns: the folder ID of the specified album, or undefined if not found.*/

  // Retrieve all albums data from the specified Google Sheet
  const allAlbums = getSheet(AOC_SHEETS_ID, ALBUMS_SHEET.NAME).getDataRange().getValues();

  // Filter the album data based on the provided album name and group ID
  const albumLine = allAlbums.filter(function (data) {
    return (data[ALBUMS_SHEET.NAME_COL - 1] == albumName &&
      data[ALBUMS_SHEET.GROUP_ID_COL - 1] == groupId);
  }).flat();

  // Return the folder ID from the filtered album line, offsetting for zero-based index
  return albumLine[ALBUMS_SHEET.DRIVE_ID_COL - 1];
}

function getActiveAlbum(groupId) {
  /* This function retrieves the active album on the group's ID.
  It reads all album data and filters to find the active album.
  Parameters: a string representing the ID of the group.
  Returns: an array containing the active album for the specified group.*/

  // Retrieve all albums data from the specified Google Sheet
  const allAlbums = getSheet(AOC_SHEETS_ID, ALBUMS_SHEET.NAME).getDataRange().getValues();

  // Filter the album data to find the active album for the provided group ID
  return allAlbums.filter(function (data) {
    return (data[ALBUMS_SHEET.GROUP_ID_COL - 1] == groupId &&
      data[ALBUMS_SHEET.ACTIVE_COL - 1]);
  }).flat();
}

function getGroupAlbums(groupId) {
  /* This function retrieves all albums fbased on the group's ID.
  It reads all album data and filters to find all albums associated with the group.
  Parameters: a string representing the ID of the group.
  Returns: an array containing all albums for the specified group.*/

  // Retrieve all albums data from the specified Google Sheet
  const allAlbums = getSheet(AOC_SHEETS_ID, ALBUMS_SHEET.NAME).getDataRange().getValues();

  // Filter the album data to find all albums for the provided group ID
  return allAlbums.filter(function (data) {
    return (data[ALBUMS_SHEET.GROUP_ID_COL - 1] == groupId);
  });
}

function alreadyExists(groupId, albumName) {
  /* This function checks for the existence of an album within a specific group 
  by searching for the provided album name.
  Parameters:
  - groupId: a string representing the ID of the group.
  - albumName: a string representing the name of the album to check for.
  Returns: true if an album with the same name exists; false otherwise.*/

  // Retrieve all albums data from the specified Google Sheet
  const allTxsUsers = getSheet(AOC_SHEETS_ID, ALBUMS_SHEET.NAME).getDataRange().getValues();

  // Check if any album matches the specified group ID and album name
  return allTxsUsers.some(row => {
    return (row[ALBUMS_SHEET.GROUP_ID_COL - 1] == groupId &&
      row[ALBUMS_SHEET.NAME_COL - 1] == albumName);
  });
}

function deleteAlbum(groupId, albumName) {
  /* This function deletes a specified album based on the group's ID 
  and the album name. It locates the correct row and removes it from the sheet.
  Parameters:
  - groupId: a string representing the ID of the group.
  - albumName: a string representing the name of the album to delete.*/

  // Retrieve the sheet for albums
  const albumsSheet = getSheet(AOC_SHEETS_ID, ALBUMS_SHEET.NAME);

  // Find the row index of the album to delete based on group ID and album name
  const rowIndex = albumsSheet.getDataRange().getValues().findIndex(row =>
    row[ALBUMS_SHEET.GROUP_ID_COL - 1] == groupId &&
    row[ALBUMS_SHEET.NAME_COL - 1] == albumName
  );

  // Check if the album was found before attempting to delete
  if (rowIndex !== -1) {
    albumsSheet.deleteRow(rowIndex + 1); // Delete the row (1-based index)
  } else {
    throw new Error(`[deleteAlbum(groupId=${groupId}, albumName=${albumName})] Album not found.`);
  }
}

function setActive(groupId, albumName, value) {
  /* This function sets the active state of a specified album based on the group's ID 
  and the album name. It updates the active column of the album row with the provided value.
  Parameters:
  - groupId: a string representing the ID of the group.
  - albumName: a string representing the name of the album to update.
  - value: a boolean indicating the active state (true to activate, false to deactivate).*/

  // Retrieve the sheet for albums
  const albumsSheet = getSheet(AOC_SHEETS_ID, ALBUMS_SHEET.NAME);

  // Get all albums data from the sheet
  const allAlbums = albumsSheet.getDataRange().getValues();

  // Find the row index of the album to update based on group ID and album name
  const rowIndex = allAlbums.findIndex(row =>
    row[ALBUMS_SHEET.GROUP_ID_COL - 1] == groupId &&
    row[ALBUMS_SHEET.NAME_COL - 1] == albumName
  );

  // Check if the album was found before updating
  if (rowIndex !== -1) {
    albumsSheet.getRange(rowIndex + 1, ALBUMS_SHEET.ACTIVE_COL).setValue(value); // Update the active column
  } else {
    throw new Error(`[setActive(groupId=${groupId}, albumName=${albumName}, value=${value})] Album not found.`);
  }
}

//_____________ Albums Tx _____________

function newAlbum(user, groupId, groupTitle) {
  /* This function initializes a new album creation transaction for the specified user.
  It clears any existing transactions for the user and appends a new row to the
  transactions sheet with the user's information and group details.
  Parameters:
  - user: a string representing the unique identifier of the user.
  - groupId: a string representing the ID of the group.
  - groupTitle: a string representing the title of the group.*/

  const albumsTxSheet = getSheet(AOC_SHEETS_ID, ALBUMS_TX_SHEET.NAME); // Retrieve the transactions sheet
  deleteUserTxs(user); // Clear existing transactions for the user
  albumsTxSheet.appendRow([user, NEW_ALBUM_NAME_STEP, groupId, groupTitle]); // Append new transaction row
}

function deleteUserTxs(user) {
  /* This function searches for and deletes all transaction rows associated 
  with the specified user in the transactions sheet.
  Parameters: a string representing the unique identifier of the user.*/

  const albumsTxSheet = getSheet(AOC_SHEETS_ID, ALBUMS_TX_SHEET.NAME); // Retrieve the transactions sheet
  const allTxs = albumsTxSheet.getDataRange().getValues(); // Get all transaction data
  const rowsToDelete = []; // Initialize an array to hold rows to delete

  // Identify rows matching the user
  allTxs.forEach((row, index) => {
    if (row[ALBUMS_TX_SHEET.USER_COL - 1] == user) {
      rowsToDelete.push(index + 1); // Store the 1-based row index for deletion
    }
  });

  // Delete identified rows in reverse order to maintain correct indexing
  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    albumsTxSheet.deleteRow(rowsToDelete[i]);
  }
}

function getStep(user) {
  /* This function retrieves the current step of the specified user
  from the transactions sheet.
  Parameters: a string representing the unique identifier of the user.
  Returns: the value of the current step for the user.*/

  return getSheet(AOC_SHEETS_ID, ALBUMS_TX_SHEET.NAME).getRange(getUserLine(user), ALBUMS_TX_SHEET.STEP_COL).getValue();
}

function getGroupId(user) {
  /* This function retrieves the group ID associated with the specified user's transaction
  from the transactions sheet.
  Parameters: a string representing the unique identifier of the user.
  Returns: a string representing the group ID of the user's transaction.*/

  return getSheet(AOC_SHEETS_ID, ALBUMS_TX_SHEET.NAME).getRange(getUserLine(user), ALBUMS_TX_SHEET.GROUP_ID_COL).getValue();
}

function getUserLine(user) {
  /* This function searches for the specified user's unique identifier in the 
  transactions sheet and returns the corresponding line number.
  Parameters: a string representing the unique identifier of the user.
  Returns: the line number of the user's transaction; -1 if not found.*/

  const albumsTxsSheet = getSheet(AOC_SHEETS_ID, ALBUMS_TX_SHEET.NAME); // Retrieve the transactions sheet
  const allTxsUsers = albumsTxsSheet.getRange(1, ALBUMS_TX_SHEET.USER_COL, albumsTxsSheet.getLastRow()).getValues().flat(); // Get all user IDs
  const rowIndex = allTxsUsers.indexOf(user); // Find the index of the user
  return rowIndex !== -1 ? rowIndex + 1 : -1; // Return the line number (1-based index) or -1 if not found
}

function setAlbumName(user, name) {
  /* This function updates the album name for the specified user in the transactions sheet.
  Parameters:
  - user: a string representing the unique identifier of the user.
  - name: a string representing the new name of the album.*/

  getSheet(AOC_SHEETS_ID, ALBUMS_TX_SHEET.NAME).getRange(getUserLine(user), ALBUMS_TX_SHEET.NAME_COL).setValue(name); // Set the album name 
}

function getAlbumName(user) {
  /* This function retrieves the name of the album associated with the 
  specified user's transaction from the transactions sheet.
  Parameters: a string representing the unique identifier of the user.
  Returns: a string representing the name of the album.*/

  return getSheet(AOC_SHEETS_ID, ALBUMS_TX_SHEET.NAME).getRange(getUserLine(user), ALBUMS_TX_SHEET.NAME_COL).getValue(); // Get the album name from the sheet
}

function setFolderId(user, folderId) {
  /* This function updates the folder ID associated with the specified user's album
  in the transactions sheet.
  Parameters:
  - user: a string representing the unique identifier of the user.
  - folderId: a string representing the ID of the folder.*/

  // Set the folder ID in the transactions sheet
  getSheet(AOC_SHEETS_ID, ALBUMS_TX_SHEET.NAME).getRange(getUserLine(user), ALBUMS_TX_SHEET.DRIVE_ID_COL).setValue(folderId);
}

function setStep(user, step) {
  /* This function updates the current step for the specified user in the 
  transactions sheet.
  Parameters:
  - user: a string representing the unique identifier of the user.
  - step: a value representing the new step to set.*/

  // Set the current step in the transactions sheet
  getSheet(AOC_SHEETS_ID, ALBUMS_TX_SHEET.NAME).getRange(getUserLine(user), ALBUMS_TX_SHEET.STEP_COL).setValue(step);
}

function createAlbum(user) {
  /* This function creates a new album for the specified user.
  It retrieves the user's group ID, group title, folder ID, and album name 
  from the transactions sheet, and appends the details to the albums sheet.
  Parameters: a string representing the unique identifier of the user.
  Returns: an object containing the group ID, group title, album name, and folder ID.*/

  const albumsTxsSheet = getSheet(AOC_SHEETS_ID, ALBUMS_TX_SHEET.NAME); // Retrieve the transactions sheet
  const userLine = getUserLine(user); // Get the user's line number in the transactions sheet

  // Retrieve group ID, group title, folder ID, and album name based on the user's line
  const groupId = albumsTxsSheet.getRange(userLine, ALBUMS_TX_SHEET.GROUP_ID_COL).getValue();
  const groupTitle = albumsTxsSheet.getRange(userLine, ALBUMS_TX_SHEET.GROUP_TITTLE_COL).getValue();
  const folderId = albumsTxsSheet.getRange(userLine, ALBUMS_TX_SHEET.DRIVE_ID_COL).getValue();
  const albumName = albumsTxsSheet.getRange(userLine, ALBUMS_TX_SHEET.NAME_COL).getValue();

  const albumsSheet = getSheet(AOC_SHEETS_ID, ALBUMS_SHEET.NAME); // Retrieve the albums sheet

  // Append a new row containing the album details
  albumsSheet.appendRow([groupId, groupTitle, Boolean(false), albumName, folderId]);

  // Log the creation of the album
  log(['📂 Album created', groupId, groupTitle, Boolean(false), albumName, folderId]);

  // Return an object with the relevant album information
  return { groupId, groupTitle, albumName, folderId };
}
