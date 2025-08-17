import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_name = "Shunian/mbti-classification-roberta-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)


print("✅ MBTI model loaded successfully!")
