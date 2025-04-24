function uploadFile(fileName, album, fileBlob, fileType) {
  /* This function attempts to create and upload a file in the specified folder,
  sets the file's name, and adjusts sharing permissions.
  Parameters:
  - fileName: a string representing the name of the file to be uploaded.
  - album: an object containing album information including the Drive folder ID.
  - fileBlob: a Blob object representing the file data to be uploaded.
  - fileType: a string indicating the type of file ('image' or 'video').
  Returns: the file object if the upload was successful; undefined if an error occurred.*/

  // Retrieve the folderId from the album object, adjusting for zero-based index
  const folderId = album[ALBUMS_SHEET.DRIVE_ID_COL - 1];

  try {
    // Create the file in the specified folder and set its name
    const file = DriveApp.getFolderById(folderId).createFile(fileBlob).setName(fileName);

    // Set sharing permissions to allow anyone with the link to view the file
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Determine the action message based on the file type
    const actionMessage = fileType === 'image' ? 'Image added' : 'Video added';

    // Log the successful upload with relevant details
    log([`📁 ${actionMessage}`, album[ALBUMS_SHEET.NAME_COL - 1], fileName, `${FOLDERS_URL_PREFIX}${folderId}`]);

    // Return the created file object
    return file;
  } catch (error) {
    // Throw a detailed error message including the function name if the upload fails
    throw new Error(`[uploadFile(filename=${fileName}, album, fileBlob, fileType=${fileType})] Could not upload the file to the folder`);
  }
}

function deleteFileByName(folderId, fileName) {
  /* This function searches for a file by its name in the specified folder 
  and moves it to the trash if found.
  Parameters:
  - folderId: A string representing the ID of the Google Drive folder
  - fileName: A string representing the name of the file to be deleted.*/

  try {
    // Get all files with the specified name in the folder
    const files = DriveApp.getFolderById(folderId).getFilesByName(fileName);

    // Check if any file was found
    if (files.hasNext()) {
      // Move the first found file to trash
      files.next().setTrashed(true);
      log(['🗑 File removed', fileName, folderId]);
    } else {
      throw new Error();
    }
  } catch (error) {
    // Throw an error if the deletion could not be completed
    throw new Error(`[deleteFileByName(folderId=${folderId}, fileName=${fileName})] Could not delete the file from folder.`);
  }
}

function checkFolderPermissions(folderId) {
  /* This function attempts to create, rename and delete a test file in the 
  specified folder to verify if the user has sufficient edit permissions.
  Parameters: a string representing the ID of the Google Drive folder to check.
  Returns: true if editing permissions are granted, false if they are not.*/

  try {
    // Get the folder object using the provided folderId
    const folder = DriveApp.getFolderById(folderId);

    // Attempt to create a test file in the folder
    const testFile = folder.createFile('test.txt', 'This is a test file.');

    // Rename the test file to verify permissions
    testFile.setName('renamed_test.txt');

    // Move the file to trash to clean up and verify delete permissions
    testFile.setTrashed(true);

    // If no errors occurred, return true indicating sufficient permissions
    return true;
  } catch (error) {
    // Return false if an error occurs, indicating insufficient permissions
    return false;
  }
}

function extractFolderId(url) {
  /* This function searches for a unique identifier in the URL, which is expected 
  to have at least 25 alphanumeric characters or hyphens, the typical format 
  for a folder ID in Google Drive.
  Parameters: a string representing the Google Drive URL from which the folderId will be extracted.
  Returns: an object with properties 'found' (boolean) indicating if a valid ID was found 
  and 'folderId' (string) containing the ID or the original URL if not found.*/

  // Use a regular expression to search for a pattern of at least 25 alphanumeric characters or hyphens
  const folderIdMatch = url.match(/[-\w]{25,}/);

  // Check if a match was found and return the result in an object
  if (folderIdMatch && folderIdMatch[0]) {
    return { found: true, folderId: folderIdMatch[0] };  // Return the found folderId
  } else {
    return { found: false, folderId: url };  // Return the original URL as folderId if none found
  }
}
