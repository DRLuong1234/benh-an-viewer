import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

# Lấy thông tin từ biến môi trường
credentials_json = os.getenv('GDRIVE_CREDENTIALS')
file_id = os.getenv('GDRIVE_FILE_ID')

# Tạo credentials từ JSON
credentials_dict = json.loads(credentials_json)
credentials = service_account.Credentials.from_service_account_info(
    credentials_dict,
    scopes=['https://www.googleapis.com/auth/drive.readonly']
)

# Kết nối với Google Drive API
service = build('drive', 'v3', credentials=credentials)

# Tải file data.json
request = service.files().get_media(fileId=file_id)
fh = io.FileIO('data.json', 'wb')
downloader = MediaIoBaseDownload(fh, request)
done = False
while done is False:
    status, done = downloader.next_chunk()
    print(f"Download {int(status.progress() * 100)}%.")

print("Download completed!")
