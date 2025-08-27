
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    TrainingArguments, Trainer
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from datasets import load_dataset

# Step 1: Load dataset from HuggingFace
ds = load_dataset("Legend0300/MBTI")


# Step 2: Prepare label mapping
labels = ds["train"].unique("labels")
label2id = {label: i for i, label in enumerate(labels)}
id2label = {i: label for label, i in label2id.items()}

def map_label(example):
    example["labels"] = label2id[example["labels"]]
    return example
ds = ds.map(map_label)


# Step 3: Split train set into train/test splits
train_test = ds["train"].train_test_split(test_size=0.2, seed=42)

# Step 4: Load tokenizer and model
model_name = "Shunian/mbti-classification-roberta-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    model_name, num_labels=len(labels), id2label=id2label, label2id=label2id, ignore_mismatched_sizes=True
)

# Step 5: Tokenize
def tokenize(example):
    return tokenizer(example["Sentence"], padding="max_length", truncation=True)

tokenized_datasets = train_test.map(tokenize, batched=True)

# Step 5: Define metrics
def compute_metrics(p):
    preds = p.predictions.argmax(-1)
    labels = p.label_ids
    acc = accuracy_score(labels, preds)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average='weighted')
    return {"accuracy": acc, "precision": precision, "recall": recall, "f1": f1}

# Step 6: Training setup
training_args = TrainingArguments(
    output_dir="./mbti_model_v2",
    per_device_train_batch_size=2,
    per_device_eval_batch_size=4,
    num_train_epochs=3,
    logging_dir="./logs",
    save_strategy="no"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
    tokenizer=tokenizer,
    compute_metrics=compute_metrics
)

# Step 7: Train and Evaluate
trainer.train()
eval_result = trainer.evaluate()
print("📊 Evaluation:", eval_result)

# Step 8: Save model
model.save_pretrained("./mbti_model_v2")
tokenizer.save_pretrained("./mbti_model_v2")
