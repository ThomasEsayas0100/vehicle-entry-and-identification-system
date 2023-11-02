import os
from flask import Flask, jsonify, send_from_directory, request
from google.cloud import firestore
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()

# Initialize Firestore client with the configuration 
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("DATABASE_CREDENTIALS")

db = firestore.Client()

columns = ["ID", "License", "First Name", "Last Name"]
@app.route('/data', methods=['GET'])

def get_data():
    # Retrieve data from Firestore
    collection_ref = db.collection('users')
    query = collection_ref.stream()
    data = []
    for doc in query:
        doc_data = doc.to_dict()
        doc_data['id'] = doc.id
        data.append(doc_data)
    # Return the data as a JSON response
    return jsonify(data)


@app.route('/update', methods=['POST'])
def update_data():
    # Retrieve updated data from request.json
    updated_data = request.json
    # Store the updated data in Firestore
    collection_ref = db.collection("users")

    docs = collection_ref.stream()
    for doc in docs:
        doc.reference.delete()

    for document_data in updated_data:
        document_id = document_data.get("id")
        document_data.pop("id", None)
        doc_ref = collection_ref.document(document_id)
        print(document_data)
        if not all(element is None or element == "" for element in document_data.values()):
            doc_ref.set(document_data)
    
    updated_data = [row for row in updated_data if not all(element is None for element in row.values())]
    # Return a response indicating success
    return 'Data saved/updated successfully!'
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run()

