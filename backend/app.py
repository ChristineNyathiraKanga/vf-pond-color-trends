from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import numpy as np
from models import db, Pond_Color_Trends, User
import base64
import os
from datetime import datetime
from config import Config
from flask_caching import Cache
from flask import make_response
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
import boto3
import csv
import io
import uuid

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config.from_object(Config)
db.init_app(app)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

s3 = boto3.client('s3',
    aws_access_key_id=app.config['AWS_ACCESS_KEY'],
    aws_secret_access_key=app.config['AWS_SECRET_KEY']
)


# Color palette
colors = [
    { "name":
 'Sea Nettle', "code": '#8A8B54' },
    { "name":
 'Emerald Delight 4', "code": '#41AA7D' },
    { "name":
 'Crushed Pine 2', "code": '#5B9A70' },
    { "name":
 'Mountain Moss', "code": '#968A3B' },
    { "name":
 'Celtic Forest 1', "code": '#817D59' },
    { "name":
 'Jungle Fever 1', "code": '#75845D' },
    { "name":
 'Parrots Plume', "code": '#71A63F' },
    { "name":
 'Guild Green', "code": '#777B5B' },
    { "name":
 'English Mist 1', "code": '#777B5B' },
    { "name":
 'Forest Falls 1', "code": '#1CAD78' },
    { "name":
 'Goosebery Fool 1', "code": '#787256' },
    { "name":
 'Rainforest Canopy', "code": '#888C29' },
    { "name":
 'Woodland Fern 3', "code": '#6D9736' },
    { "name":
 'Grecian Spa 1', "code": '#00AA8F' },
    { "name":
 'Woodland Pearl 1', "code": '#65775B' },
    { "name":
 'Minted Glory 4', "code": '#00A58D' },
    { "name":
 'Jade Cluster 4', "code": '#00AD85' },
    { "name":
 'Soft Fauna 1', "code": '#517367' },
    { "name":
 'Highland Falls 1', "code": '#57725E' },
    { "name":
 'Celtic Moor 1', "code": '#648637' },
    { "name":
 'Nordic Hills', "code": '#6C6B3E' },
    { "name":
 'Tuscan Glade 1', "code": '#536C51' },
    { "name":
 'Japanese Maze1', "code": '#527143' },
    { "name":
 'Wild Cactus', "code": '#636040' },
    { "name":
 'Moorland Magic 1', "code": '#497839' },
    { "name":
 'Crushed Pine 1', "code": '#34794D' },
    { "name":
 'Dublic Bay 3', "code": '#2E8F3D' },
    { "name":
 'Lush Grass', "code": '#2E8F3D' },
    { "name":
 'Minted Glory 3', "code": '#008571' },
    { "name":
 'Turquoise Copper', "code": '#007F74' },
    { "name":
 'Emerald Delight 2', "code": '#207856' },
    { "name":
 'LLB Perfect Peacock', "code": '#39595B' },
    { "name":
 'Jade Cluster 3', "code": '#008763' },
    { "name":
 'Peppermint Beach 1', "code": '#008466' },
    { "name":
 'Woodland Fern 2', "code": '#466A39' },
    { "name":
 'Emerald Delight 3', "code": '#008F54' },
    { "name":
 'Nina\'s Green', "code": '#524E3F' },
    { "name":
 'Jade Cluster 2', "code": '#007C5C' },
    { "name":
 'Fortune Green', "code": '#007067' },
    { "name":
 'Paradise Green 2', "code": '#1F7042' },
    { "name":
 'Vine Leaf', "code": '#3B6035' },
    { "name":
 'Amazon Jungle 1', "code": '#346437' },
    { "name":
 'Fresh Pine', "code": '#23693B' },
    { "name":
 'Minted Glory 2', "code": '#0D6456' },
    { "name":
 'Dublic Bay 2', "code": '#266A34' },
    { "name":
 'Paradise Green 1', "code": '#2B5C3D' },
    { "name":
 'Woodland Fern 1', "code": '#32523D' },
    { "name":
 'Indian Ivy 1', "code": '#3D512B' },
    { "name":
 'Forest Festival', "code": '#03664F' },
    { "name":
 'Everglade Forest', "code": '#304B38' },
    { "name":
 'Pine Needle', "code": '#2A493F' },
    { "name":
 'Palm Night', "code": '#384137' },
    { "name":
 'Dublin Bay 1', "code": '#19563E' },
    { "name":
 'Alpine View', "code": '#2D3D39' },
    { "name":
 'Emerald Delight 1', "code": '#025E42' },
    { "name":
 'Jade Cluster 1', "code": '#005345' },
    { "name":
 'Minted Glory 1', "code": '#00533F' },
    ]

@app.route('/create_user', methods=['POST'])
def create_user():
    data = request.json
    email = data['email']
    password = generate_password_hash(data['password'])
    
    # Check if user with the same email already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "User with this email already exists."}), 400
    
    new_user = User(email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User created successfully!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({'token': token})

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logout successful!"}), 200
    
def hex_to_rgb(hex_color):
    #remove the '#' symbol from the input hex_color
    hex_color = hex_color.lstrip('#')
    # generates a tuple of RGB values by converting substrings of the hex_color into integers using (hexadecimal) 
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    """ Find closest color in palette """
def closest_color(requested_color):
    min_color = None
    min_distance = float('inf')
    requested_rgb = hex_to_rgb(requested_color)
    
    #Calculate the distance between the requested color and each color in the palette using the Euclidean distance formula
    for color in colors:
        palette_rgb = hex_to_rgb(color["code"])
        distance = np.linalg.norm(np.array(requested_rgb) - np.array(palette_rgb))
        
        if distance < min_distance:
            min_distance = distance
            min_color = color
    
    return min_color

@app.route('/match-color', methods=['POST'])
def match_color():
    if request.method == 'POST':
        data = request.get_json()
        sRGBHex = data.get('sRGBHex', None)
        
        if sRGBHex:
            closest = closest_color(sRGBHex)
            return jsonify({
                "name": closest["name"],
                "code": closest["code"]
            })
        else:
            return jsonify({"error": "could not find a match"}), 400
         
# @app.route('/submit', methods=['POST'])
# def submit():
#     data = request.json
#     try:
#         # Save the image
#         image_data = data['image'].split(",")[1]
#         image_filename = data['imageFilename']
#         image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
#         with open(image_path, "wb") as f:
#             f.write(base64.b64decode(image_data))

#         # Save each record in the database
#         for selection in data['selections']:
#             pond_image = Pond_Color_Trends(
#                 image_filename=image_filename,
#                 closest_color_name=selection.get('closestColor', {}).get('name', ''),
#                 closest_color_code=selection.get('closestColor', {}).get('code', ''),
#                 category=selection.get('category', ''),
#                 pond=selection.get('pond', ''),
#                 date=datetime.strptime(data['date'], '%a %b %d %Y %H:%M:%S GMT%z (East Africa Time)')
#             )
#             db.session.add(pond_image)

#         db.session.commit()

#         return jsonify({"message": "Data saved successfully"}), 200
#     except Exception as e:
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@app.route('/submit', methods=['POST'])
def submit():
    data = request.json
    try:
        # Save image locally (same as before)
        image_data = data['image'].split(",")[1]
        image_filename = data['imageFilename']
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
        with open(image_path, "wb") as f:
            f.write(base64.b64decode(image_data))

        # Prepare CSV row(s)
        rows = []
        submission_id = str(uuid.uuid4())
        for selection in data['selections']:
            row = [
                submission_id,
                image_filename,
                selection.get('closestColor', {}).get('name', ''),
                selection.get('closestColor', {}).get('code', ''),
                selection.get('category', ''),
                selection.get('pond', ''),
                data['date']
            ]
            rows.append(row)

        # Read existing CSV from S3 (or create new one)
        try:
            obj = s3.get_object(Bucket=app.config['AWS_S3_BUCKET'], Key=app.config['CSV_S3_KEY'])
            existing_csv = obj['Body'].read().decode('utf-8')
            csv_file = io.StringIO(existing_csv)
            reader = list(csv.reader(csv_file))
        except s3.exceptions.NoSuchKey:
            reader = [["ID", "Image File Name", "Closest Color Name", "Closest Color Code","Category", "Pond", "Date"]]

        # Append new rows
        reader.extend(rows)

        # Write back to S3
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerows(reader)
        s3.put_object(Bucket=app.config['AWS_S3_BUCKET'], Key=app.config['CSV_S3_KEY'], Body=output.getvalue())
        
        # Save each record in the database
        for selection in data['selections']:
            pond_image = Pond_Color_Trends(
                id=submission_id,
                image_filename=image_filename,
                closest_color_name=selection.get('closestColor', {}).get('name', ''),
                closest_color_code=selection.get('closestColor', {}).get('code', ''),
                category=selection.get('category', ''),
                pond=selection.get('pond', ''),
                date=datetime.strptime(data['date'], '%a %b %d %Y %H:%M:%S GMT%z (East Africa Time)')
            )
            db.session.add(pond_image)

        db.session.commit()
        return jsonify({"message": "Data saved successfully"}), 200

    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


# @app.route('/delete-data/<int:id>', methods=['DELETE'])
# def delete_data(id):
#     try: 
#         record = Pond_Color_Trends.query.get(id)
#         if record is None:
#             return make_response(jsonify({'error': 'Record not found'}), 404)

#         db.session.delete(record)
#         db.session.commit()

#         return make_response(jsonify({'message': 'Record deleted successfully'}), 200)
    
#     except Exception as e:
#         db.session.rollback()
#         return make_response(jsonify({'error': str(e)}), 500)

@app.route('/submitted-data', methods=['GET'])
@cache.cached(timeout=5)
def get_submitted_data():
    try:
        obj = s3.get_object(Bucket=app.config['AWS_S3_BUCKET'], Key=app.config['CSV_S3_KEY'])
        csv_content = obj['Body'].read().decode('utf-8')
        csv_file = io.StringIO(csv_content)
        reader = csv.DictReader(csv_file)

        data = [{
            "id": row["ID"],
            "imageFilename": row["Image File Name"],
            "closestColor": row["Closest Color Code"],
            "closestColorName": row["Closest Color Name"],
            "category": row["Category"],
            "pond": row["Pond"],
            "date": row["Date"]
        } for row in reader]

        response = make_response(jsonify(data))
        response.headers['Cache-Control'] = 'public, max-age=60'
        return response

    except Exception as e:
        return jsonify({"error": f"Failed to fetch data: {str(e)}"}), 500

@app.route('/delete-data/<string:id>', methods=['DELETE'])
def delete_data(id):
    try:
         # Read existing CSV from S3
        obj = s3.get_object(Bucket=app.config['AWS_S3_BUCKET'], Key=app.config['CSV_S3_KEY'])
        csv_content = obj['Body'].read().decode('utf-8')
        csv_file = io.StringIO(csv_content)
        reader = list(csv.reader(csv_file))

        # Remove matching rows
        header = reader[0]
        updated_rows = [row for row in reader if row[0] != id]

        # Rewrite CSV
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerows(updated_rows)
        s3.put_object(Bucket=app.config['AWS_S3_BUCKET'], Key=app.config['CSV_S3_KEY'], Body=output.getvalue())
        
         # Delete from database
        record = Pond_Color_Trends.query.get(id)
        if record is None:
            return make_response(jsonify({'error': 'Record not found'}), 404)

        db.session.delete(record)
        db.session.commit()
        
        
        return jsonify({"message": "Record deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete record: {str(e)}"}), 500


@app.route('/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
