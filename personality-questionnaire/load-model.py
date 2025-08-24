import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_name = "Shunian/mbti-classification-roberta-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)



def predict_mbti(text: str) -> str:
	inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
	with torch.no_grad():
		outputs = model(**inputs)
		logits = outputs.logits
		predicted_class = torch.argmax(logits, dim=1).item()
	# MBTI types in order for Shunian/mbti-classification-roberta-base
	mbti_types = ["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
				  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"]
	return mbti_types[predicted_class]

print("✅ MBTI model loaded successfully!")
