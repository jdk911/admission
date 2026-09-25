/**
 * Serves the HTML Admission Form
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Online School Admission Portal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Processes the submitted admission form, saves camera photo to Drive,
 * generates the unique Application ID, and logs data to Google Sheets.
 */
function submitAdmissionForm(formData) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // Prevent concurrent write collisions

  try {
    const sheet = getOrCreateAdmissionSheet();
    
    // 1. Generate Unique Application Code: yymmdd/block/Class/Students Name first 4 character
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePart = `${yy}${mm}${dd}`;

    const cleanBlock = (formData.block || 'BLK')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    const cleanClass = (formData.admissionClass || 'CLS')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    const cleanName = (formData.studentName || 'STUD')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .padEnd(4, 'X')
      .substring(0, 4);

    const applicationId = `${datePart}/${cleanBlock}/${cleanClass}/${cleanName}`;

    // 2. Save Captured Camera Photo (Base64) to Google Drive
    let photoUrl = 'No Photo Captured';
    if (formData.photoBase64 && formData.photoBase64.includes('base64,')) {
      const folder = getOrCreatePhotoFolder();
      const base64Data = formData.photoBase64.split('base64,')[1];
      const decodedBlob = Utilities.newBlob(
        Utilities.base64Decode(base64Data),
        'image/jpeg',
        `${applicationId.replace(/\//g, '_')}.jpg`
      );
      const file = folder.createFile(decodedBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      photoUrl = file.getUrl();
    }

    // 3. Append Row to Google Sheet
    sheet.appendRow([
      new Date(),
      applicationId,
      formData.schoolName,
      formData.block,
      formData.district,
      formData.admissionClass,
      formData.studentName,
      formData.fatherName,
      formData.motherName,
      formData.dob,
      formData.gender,
      formData.category,
      formData.aadhaarLast4,
      formData.mobile,
      formData.address,
      photoUrl
    ]);

    return {
      success: true,
      applicationId: applicationId,
      studentName: formData.studentName,
      schoolName: formData.schoolName
    };
  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Gets the bound spreadsheet or creates a new standalone Google Sheet automatically
 * and stores its ID in Script Properties.
 */
function getOrCreateAdmissionSheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty('ADMISSION_SHEET_ID');
  let ss = null;

  if (ssId) {
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch (e) {
      ss = null;
    }
  }

  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    ss = SpreadsheetApp.create('Govt_School_Online_Admissions_DB');
    props.setProperty('ADMISSION_SHEET_ID', ss.getId());
  }

  let sheet = ss.getSheetByName('Admissions');
  if (!sheet) {
    sheet = ss.insertSheet('Admissions');
    const headers = [
      'Timestamp',
      'Application Code',
      'Full School Name',
      'Block',
      'District',
      'Admission Class',
      'Student Name',
      'Father Name',
      'Mother Name',
      'Date of Birth',
      'Gender',
      'Category',
      'Aadhaar (Last 4 Digits)',
      'Mobile Number',
      'Full Address',
      'Student Photo Link'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#dbeafe');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Gets or creates a dedicated Google Drive folder for student photos
 */
function getOrCreatePhotoFolder() {
  const folderName = 'Govt_School_Admission_Photos';
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}
