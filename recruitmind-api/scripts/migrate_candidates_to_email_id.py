import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate('./utils/firebase_config.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

print('Migrating candidate documents to use plain email as document ID...')
candidates_ref = db.collection('candidates')
docs = candidates_ref.stream()
count_copied = 0
count_skipped = 0
count_deleted = 0
for doc in docs:
    data = doc.to_dict()
    email = data.get('email')
    if email:
        # Check if already exists
        new_doc_ref = candidates_ref.document(email)
        if not new_doc_ref.get().exists:
            new_doc_ref.set(data)
            print(f'Copied candidate {doc.id} to {email}')
            count_copied += 1
        else:
            print(f'Candidate {email} already exists, skipping copy.')
        # Delete old doc if not using email as ID
        if doc.id != email:
            doc.reference.delete()
            print(f'Deleted old candidate doc {doc.id}')
            count_deleted += 1
    else:
        print(f'Skipped candidate {doc.id} (no email)')
        count_skipped += 1
print(f'Migration complete! Copied: {count_copied}, Deleted: {count_deleted}, Skipped: {count_skipped}')
