import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate('s:/SLIITA/Year 3 UOB/RecruitMind/recruitmind-api/utils/firebase_config.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Helper to update candidateId/email in a collection
def update_collection_with_email(collection_name, id_field='candidate_id', email_field='email'):
    print(f'Processing {collection_name}...')
    docs = db.collection(collection_name).stream()
    for doc in docs:
        data = doc.to_dict()
        # Try to get email from candidates collection if missing
        candidate_id = data.get(id_field)
        email = data.get(email_field)
        if not candidate_id and email:
            candidate_id = email
        if not candidate_id:
            # Try to fetch from candidates collection
            if email:
                candidate_doc = db.collection('candidates').where('email', '==', email).get()
                if candidate_doc:
                    candidate_id = email
        if candidate_id and (data.get(id_field) != candidate_id):
            db.collection(collection_name).document(doc.id).update({id_field: candidate_id})
            print(f'Updated {doc.id} in {collection_name} with candidate_id: {candidate_id}')

# Update all relevant collections
update_collection_with_email('leadership_results')
update_collection_with_email('mbti_results')
update_collection_with_email('emotion_analysis')
update_collection_with_email('video_submissions')

print('Migration complete!')
