"""
Book 4: Data Science
Data Analysis with Pandas - Chapter 3
"""

import pandas as pd
import numpy as np

print("=" * 50)
print("PANDAS DATA STRUCTURES")
print("=" * 50)

# Series (1D)
s = pd.Series([10, 20, 30, 40], index=['a', 'b', 'c', 'd'])
print(f"Series:\n{s}")

# DataFrame (2D)
data = {
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'age': [25, 30, 35, 28, 32],
    'city': ['NYC', 'LA', 'Chicago', 'Seattle', 'Boston'],
    'salary': [50000, 60000, 70000, 55000, 65000],
    'department': ['IT', 'HR', 'IT', 'Marketing', 'HR']
}
df = pd.DataFrame(data)
print(f"\nDataFrame:\n{df.head()}")

# Basic Info
print(f"\n--- DataFrame Info ---")
print(f"Shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
print(df.describe())

# Data Selection
print("\n--- Data Selection ---")
print(f"df['name']:\n{df['name']}")
print(f"\ndf[df['age'] > 30]:\n{df[df['age'] > 30]}")

# Group by
print("\n--- Group By ---")
grouped = df.groupby('department').mean()
print(f"Mean by department:\n{grouped}")

# Sort
print("\n--- Sort ---")
sorted_df = df.sort_values('salary', ascending=False)
print(sorted_df[['name', 'salary']].head())

# Sales by Product
print("\n--- Sales by Product ---")
sales_data = pd.DataFrame({
    'product': np.random.choice(['A', 'B', 'C', 'D'], 100),
    'region': np.random.choice(['North', 'South', 'East', 'West'], 100),
    'quantity': np.random.randint(1, 50, 100),
    'price': np.random.uniform(10, 100, 100)
})
sales_data['revenue'] = sales_data['quantity'] * sales_data['price']
print(f"Total Revenue: ${sales_data['revenue'].sum():,.2f}")

by_product = sales_data.groupby('product')['revenue'].sum()
print(f"\nSales by Product:\n{by_product}")
