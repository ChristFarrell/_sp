# Book 4: Data Science with AI

*Learn to analyze data, create visualizations, and understand ML basics with AI guidance*

---

## Table of Contents

1. [Introduction to Data Science](#intro)
2. [Python for Data Science](#python)
3. [Data Analysis with Pandas](#pandas)
4. [Data Visualization](#visualization)
5. [Introduction to Machine Learning](#ml)
6. [Real-World Projects](#projects)
7. [AI Prompts for Data Science](#ai-prompts)

---

<a name="intro"></a>
## Chapter 1: Introduction to Data Science

### What is Data Science?
Data Science combines statistics, programming, and domain knowledge to extract insights from data.

### The Data Science Pipeline
```
COLLECT → CLEAN → ANALYZE → VISUALIZE → MODEL → DEPLOY
```

### Tools of the Trade
| Tool | Purpose |
|------|---------|
| Python | Main programming language |
| Pandas | Data manipulation |
| NumPy | Numerical computing |
| Matplotlib/Seaborn | Visualization |
| Scikit-learn | Machine learning |
| Jupyter | Interactive notebooks |

### Setting Up Your Environment
```bash
pip install jupyter pandas numpy matplotlib seaborn scikit-learn
jupyter notebook
```

**AI Tip:** Ask "How do I set up a data science environment?"

---

<a name="python"></a>
## Chapter 2: Python for Data Science

### NumPy Basics
```python
import numpy as np

# Creating arrays
arr = np.array([1, 2, 3, 4, 5])
zeros = np.zeros(10)
random_arr = np.random.rand(5)

# Array operations
arr * 2  # [2, 4, 6, 8, 10]
arr ** 2  # [1, 4, 9, 16, 25]
np.sqrt(arr)  # [1.0, 1.41, 1.73, 2.0, 2.24]

# Statistics
arr.mean()  # 3.0
arr.std()   # 1.41
arr.sum()   # 15
```

### List Comprehensions
```python
# Traditional loop
squares = []
for i in range(10):
    squares.append(i ** 2)

# List comprehension
squares = [i ** 2 for i in range(10)]

# With condition
evens = [i for i in range(20) if i % 2 == 0]
```

---

<a name="pandas"></a>
## Chapter 3: Data Analysis with Pandas

### Pandas Data Structures
```python
import pandas as pd

# Series (1D)
s = pd.Series([10, 20, 30, 40], index=['a', 'b', 'c', 'd'])

# DataFrame (2D)
data = {
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['NYC', 'LA', 'Chicago']
}
df = pd.DataFrame(data)
print(df.head())
print(df.describe())
```

### Data Selection
```python
# Select columns
df['name']           # Single column
df[['name', 'age']]  # Multiple columns

# Conditional selection
df[df['age'] > 30]   # Filter rows
```

### Data Cleaning
```python
# Handle missing values
df.isnull()            # Check for nulls
df.dropna()            # Remove rows with nulls
df.fillna(0)           # Fill nulls with value

# Remove duplicates
df.drop_duplicates()
```

---

<a name="visualization"></a>
## Chapter 4: Data Visualization

### Matplotlib Basics
```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2, label='sin(x)')
plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.title('Sine Wave')
plt.legend()
plt.grid(True)
plt.show()
```

### Multiple Plots
```python
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

axes[0, 0].plot(x, np.sin(x), 'r-')
axes[0, 1].scatter(np.random.rand(50), np.random.rand(50))
axes[1, 0].bar(['A', 'B', 'C'], [10, 20, 15])
axes[1, 1].hist(np.random.randn(100), bins=20)

plt.tight_layout()
plt.show()
```

### Seaborn Statistical Plots
```python
import seaborn as sns

# Distribution plot
sns.histplot(df['column'], kde=True)

# Box plot
sns.boxplot(x='category', y='value', data=df)

# Heatmap
corr = df.corr()
sns.heatmap(corr, annot=True, cmap='coolwarm')
```

---

<a name="ml"></a>
## Chapter 5: Introduction to Machine Learning

### Machine Learning Types
```
SUPERVISED     → Classification, Regression
UNSUPERVISED   → Clustering, Dimensionality Reduction
REINFORCEMENT  → Game AI, Robotics
```

### Linear Regression
```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Sample data
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 3, 5, 7])

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = LinearRegression()
model.fit(X_train, y_train)

# Predict and evaluate
y_pred = model.predict(X_test)
print(f"R² Score: {r2_score(y_test, y_pred):.2f}")
```

### Classification with KNN
```python
from sklearn.neighbors import KNeighborsClassifier
from sklearn.datasets import load_iris

iris = load_iris()
X, y = iris.data, iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)
knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)

accuracy = knn.score(X_test, y_test)
print(f"Accuracy: {accuracy:.2%}")
```

### Clustering with K-Means
```python
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=300, centers=4, cluster_std=0.6)
kmeans = KMeans(n_clusters=4)
labels = kmeans.fit_predict(X)
```

---

<a name="projects"></a>
## Chapter 6: Real-World Projects

### Project 1: Sales Data Analysis
```python
import pandas as pd
import matplotlib.pyplot as plt

sales = pd.read_csv('sales_data.csv')
print("Total Sales:", sales['amount'].sum())
monthly = sales.groupby(sales['date'].dt.month)['amount'].sum()
monthly.plot(kind='bar')
```

### Project 2: Customer Churn Prediction
```python
from sklearn.ensemble import RandomForestClassifier

X = df.drop(['customer_id', 'churned'], axis=1)
y = df['churned']
X_train, X_test, y_train, y_test = train_test_split(X, y)

model = RandomForestClassifier()
model.fit(X_train, y_train)
print(f"Accuracy: {model.score(X_test, y_test):.2%}")
```

---

<a name="ai-prompts"></a>
## Chapter 7: AI Prompts for Data Science

| What You Need | AI Prompt |
|---------------|-----------|
| Explain concept | "Explain [ML concept] with example" |
| Data cleaning | "How do I handle missing values in [dataframe]?" |
| Visualization | "Create visualization for [data type]" |
| ML model | "Which model for predicting [target]?" |
| Debug | "Error: [paste error]" |

---

## What's Next?

📖 **Book 5: Competitive Programming** - Sharpen algorithm skills

*Data Science turns raw data into actionable insights. You're now equipped!*
