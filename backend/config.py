import os

class Config:
    SECRET_KEY = '7rW75KvUQrCudaU'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///pond_images.db'
    # SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://victoryf_vf_pond_color_trends:7rW75KvUQrCudaU@victoryfarmskenya.com:2083/victoryf_vf_pond_color_trends_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = 'static/uploads'
    AWS_ACCESS_KEY = 'AKIAZUIMZM5PL3RINJFN'
    AWS_SECRET_KEY = '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'
    AWS_REGION = 'ap-south-1'
    AWS_S3_BUCKET = 'pondcolours'
    CSV_S3_KEY = 'colours/submissions.csv'

