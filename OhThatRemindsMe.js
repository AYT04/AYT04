/**
 * @OnlyCurrentDoc
 *
 * The above line is a directive for Google Apps Script that restricts the script's access
 * to only the current document or spreadsheet it's bound to. This is a security best practice.
 */

// This function is the main entry point for the script.
function transcribeAllAudioFiles() {
  // Get the user-specific API key and Project ID from the script's properties.
  // This is a secure way to store sensitive information.
  const API_KEY = PropertiesService.getScriptProperties().getProperty('GOOGLE_CLOUD_API_KEY');
  const PROJECT_ID = PropertiesService.getScriptProperties().getProperty('GOOGLE_CLOUD_PROJECT_ID');

  // Check if API key and Project ID are set.
  if (!API_KEY || !PROJECT_ID) {
    Logger.log("Error: GOOGLE_CLOUD_API_KEY and/or GOOGLE_CLOUD_PROJECT_ID are not set. " +
               "Please follow the setup instructions to set these properties.");
    return;
  }

  // Get the root folder of the user's Google Drive.
  const rootFolder = DriveApp.getRootFolder();
  const audioMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];

  // Search for audio files in the root folder.
  const files = rootFolder.getFilesByType(MimeType.AUDIO);

  // Check if any audio files were found.
  if (!files.hasNext()) {
    Logger.log("No audio files were found in your Google Drive's root folder.");
    return;
  }

  Logger.log("Starting transcription process for all audio files...");

  // Iterate over each audio file found.
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    const mimeType = file.getMimeType();

    Logger.log(`Processing file: ${fileName} (MIME type: ${mimeType})`);

    try {
      // Get the audio file's data as a Base64-encoded string.
      const audioBlob = file.getBlob();
      const base64Audio = Utilities.base64Encode(audioBlob.getBytes());

      // Prepare the request payload for the Speech-to-Text API.
      // This configures the transcription model and encoding.
      const payload = {
        config: {
          encoding: mimeType === 'audio/wav' ? 'LINEAR16' : 'MP3',
          sampleRateHertz: 16000, // This is a common sample rate, adjust if needed.
          languageCode: 'en-US', // Specify the language of the audio.
        },
        audio: {
          content: base64Audio,
        },
      };

      // Set the URL for the Google Cloud Speech-to-Text API.
      const apiUrl = `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`;
      
      // Make the API call using UrlFetchApp.
      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true, // This allows us to handle errors gracefully.
      };

      const response = UrlFetchApp.fetch(apiUrl, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      const responseData = JSON.parse(responseText);

      // Check for a successful response from the API.
      if (responseCode === 200) {
        // Extract the transcription from the response.
        const transcriptions = responseData.results.map(result => result.alternatives[0].transcript);
        const fullTranscript = transcriptions.join(' ');

        // Create a new text file with the transcript.
        const transcriptFileName = fileName.replace(/\.[^/.]+$/, "") + " Transcript.txt";
        const transcriptFile = DriveApp.createFile(transcriptFileName, fullTranscript, MimeType.PLAIN_TEXT);

        Logger.log(`Successfully transcribed and saved transcript as: ${transcriptFile.getName()} (${transcriptFile.getId()})`);
      } else {
        // Log an error if the API call was not successful.
        Logger.log(`API Error for file ${fileName}: Code ${responseCode}, Message: ${responseText}`);
      }
    } catch (e) {
      Logger.log(`An error occurred while processing ${fileName}: ${e.message}`);
    }
  }

  Logger.log("Transcription process complete.");
}
