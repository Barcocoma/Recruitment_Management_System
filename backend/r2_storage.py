"""
Cloudflare R2 Storage Helper Module
Handles file uploads and downloads using R2's S3-compatible API
"""
import os
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import io

class R2Storage:
    def __init__(self):
        self.account_id = os.getenv('R2_ACCOUNT_ID')
        self.access_key_id = os.getenv('R2_ACCESS_KEY_ID')
        self.secret_access_key = os.getenv('R2_SECRET_ACCESS_KEY')
        self.bucket_name = os.getenv('R2_BUCKET_NAME', 'recruitment')
        self.public_url = os.getenv('R2_PUBLIC_URL', '')  # Optional: Custom domain URL
        
        # Initialize S3 client for R2
        self.s3_client = None
        if self.account_id and self.access_key_id and self.secret_access_key:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=f'https://{self.account_id}.r2.cloudflarestorage.com',
                aws_access_key_id=self.access_key_id,
                aws_secret_access_key=self.secret_access_key,
                config=Config(signature_version='s3v4')
            )
    
    def is_configured(self):
        """Check if R2 is properly configured"""
        return self.s3_client is not None
    
    def upload_file(self, file_obj, object_name, content_type=None):
        """
        Upload a file to R2
        
        Args:
            file_obj: File-like object or bytes
            object_name: Name/path of the object in R2
            content_type: MIME type of the file (optional)
        
        Returns:
            dict with 'success' (bool) and 'url' or 'error' message
        """
        if not self.is_configured():
            return {'success': False, 'error': 'R2 not configured'}
        
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            # If file_obj is bytes, convert to BytesIO
            if isinstance(file_obj, bytes):
                file_obj = io.BytesIO(file_obj)
            
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                object_name,
                ExtraArgs=extra_args
            )
            
            # Generate URL (use public URL if available, otherwise use R2 URL)
            if self.public_url:
                url = f"{self.public_url.rstrip('/')}/{object_name}"
            else:
                url = f"https://pub-{self.account_id}.r2.dev/{self.bucket_name}/{object_name}"
            
            return {'success': True, 'url': url, 'object_name': object_name}
        except ClientError as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def download_file(self, object_name):
        """
        Download a file from R2
        
        Args:
            object_name: Name/path of the object in R2
        
        Returns:
            dict with 'success' (bool) and 'data' (bytes) or 'error' message
        """
        if not self.is_configured():
            return {'success': False, 'error': 'R2 not configured'}
        
        try:
            file_obj = io.BytesIO()
            self.s3_client.download_fileobj(
                self.bucket_name,
                object_name,
                file_obj
            )
            file_obj.seek(0)
            return {'success': True, 'data': file_obj.read()}
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                return {'success': False, 'error': 'File not found'}
            return {'success': False, 'error': str(e)}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_file_url(self, object_name, expires_in=3600):
        """
        Generate a presigned URL for temporary access
        
        Args:
            object_name: Name/path of the object in R2
            expires_in: URL expiration time in seconds (default: 1 hour)
        
        Returns:
            dict with 'success' (bool) and 'url' or 'error' message
        """
        if not self.is_configured():
            return {'success': False, 'error': 'R2 not configured'}
        
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_name},
                ExpiresIn=expires_in
            )
            return {'success': True, 'url': url}
        except ClientError as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def delete_file(self, object_name):
        """
        Delete a file from R2
        
        Args:
            object_name: Name/path of the object in R2
        
        Returns:
            dict with 'success' (bool) and optional 'error' message
        """
        if not self.is_configured():
            return {'success': False, 'error': 'R2 not configured'}
        
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
            return {'success': True}
        except ClientError as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def file_exists(self, object_name):
        """
        Check if a file exists in R2
        
        Args:
            object_name: Name/path of the object in R2
        
        Returns:
            bool: True if file exists, False otherwise
        """
        if not self.is_configured():
            return False
        
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=object_name)
            return True
        except ClientError:
            return False

# Create global instance
r2_storage = R2Storage()

