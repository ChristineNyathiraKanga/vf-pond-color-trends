import boto3
import botocore
import os

#use env variables
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_KEY')
AWS_REGION = os.getenv('AWS_REGION')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
S3_KEY = os.getenv('S3_KEY')
LOCAL_FILE_PATH = os.getenv('LOCAL_FILE_PATH')

# --- Upload to S3 ---
s3 = boto3.client(
    's3',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)

def file_exists_in_s3(bucket, key):
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == "404":
            return False
        else:
            raise

def upload_csv_to_s3(local_path, bucket, key):
    if not os.path.exists(local_path):
        print(f"❌ Local CSV file not found: {local_path}")
        return

    with open(local_path, 'rb') as f:
        s3.upload_fileobj(f, bucket, key)
    print(f"✅ CSV uploaded to s3://{bucket}/{key}")

# --- Main ---
if __name__ == '__main__':
    if file_exists_in_s3(S3_BUCKET_NAME, S3_KEY):
        print(f"ℹ️ File already exists at s3://{S3_BUCKET_NAME}/{S3_KEY}. Overwriting...")
    else:
        print(f"📁 File not found in S3. Creating new CSV...")

    upload_csv_to_s3(LOCAL_FILE_PATH, S3_BUCKET_NAME, S3_KEY)
