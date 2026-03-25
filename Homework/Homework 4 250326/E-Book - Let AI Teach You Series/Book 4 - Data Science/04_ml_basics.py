"""
Book 4: Data Science
Introduction to Machine Learning - Chapter 5
"""

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score
from sklearn.datasets import make_blobs, load_iris
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("MACHINE LEARNING BASICS")
print("=" * 60)

# 1. LINEAR REGRESSION
print("\n1. LINEAR REGRESSION")
X = np.array([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]])
y = np.array([35, 42, 50, 52, 58, 62, 68, 72, 78, 85])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(f"Coefficient: {model.coef_[0]:.2f}")
print(f"Intercept: {model.intercept_:.2f}")
print(f"R² Score: {r2_score(y_test, y_pred):.4f}")

# 2. CLASSIFICATION - KNN
print("\n2. K-NEAREST NEIGHBORS")
iris = load_iris()
X, y = iris.data, iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)
accuracy = knn.score(X_test, y_test)
print(f"Accuracy: {accuracy:.2%}")

# 3. CLUSTERING - K-MEANS
print("\n3. K-MEANS CLUSTERING")
X, _ = make_blobs(n_samples=300, centers=4, cluster_std=0.6, random_state=42)
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
labels = kmeans.fit_predict(X)

print(f"Cluster centers:\n{kmeans.cluster_centers_[:2]}")
print(f"Inertia: {kmeans.inertia_:.2f}")

# 4. FIBONACCI (DP)
print("\n4. FIBONACCI (Dynamic Programming)")
def fib(n):
    if n <= 1: return n
    prev1, prev2 = 1, 0
    for _ in range(2, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr
    return prev1

print(f"fib(10) = {fib(10)}")
print(f"fib(20) = {fib(20)}")

# 5. COIN CHANGE
print("\n5. COIN CHANGE")
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

coins = [1, 2, 5]
for amt in [11, 3, 0]:
    result = coin_change(coins, amt)
    print(f"Amount {amt}: {result} coins")

print("\n" + "=" * 60)
print("SUMMARY: ML algorithms learned!")
print("=" * 60)
