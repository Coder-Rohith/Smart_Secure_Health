import pandas as pd
from sklearn.neural_network import MLPClassifier
import pickle

# ✅ Correct loading
df = pd.read_excel("C:/Users/rohit/Downloads/indian_diseases_dataset.csv.xls")

df.columns = df.columns.str.strip()

print("Columns:", df.columns)

# Auto target (last column)
TARGET = df.columns[-1]

X = df.drop(TARGET, axis=1)
y = df[TARGET]

model = MLPClassifier(hidden_layer_sizes=(20, 10), max_iter=1000)
model.fit(X, y)

with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained successfully!")