"""
Book 4: Data Science
Data Visualization - Chapter 4
Matplotlib and Seaborn Examples
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

print("=" * 50)
print("MATPLOTLIB BASICS")
print("=" * 50)

# Basic line plot
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2, label='sin(x)')
plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.title('Sine Wave')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('plot_sine.png', dpi=100)
print("Saved: plot_sine.png")
plt.close()

# Multiple plots
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

axes[0, 0].plot(x, np.sin(x), 'r-', label='sin(x)')
axes[0, 0].plot(x, np.cos(x), 'b--', label='cos(x)')
axes[0, 0].legend()

axes[0, 1].scatter(np.random.rand(50), np.random.rand(50), alpha=0.7)

categories = ['A', 'B', 'C', 'D', 'E']
values = [23, 45, 56, 78, 32]
axes[1, 0].bar(categories, values)

data = np.random.randn(1000)
axes[1, 1].hist(data, bins=30, alpha=0.7)

plt.tight_layout()
plt.savefig('plot_grid.png', dpi=100)
print("Saved: plot_grid.png")
plt.close()

# Pie chart
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

sales_data = {'Electronics': 35000, 'Clothing': 28000, 'Food': 22000, 'Books': 15000}
axes[0].pie(sales_data.values(), labels=sales_data.keys(), autopct='%1.1f%%')
axes[0].set_title('Sales by Category')

months = ['Jan', 'Feb', 'Mar', 'Apr', 'May']
product_a = [20, 35, 30, 35, 27]
product_b = [25, 32, 34, 20, 25]
axes[1].bar(months, product_a, label='Product A')
axes[1].bar(months, product_b, bottom=product_a, label='Product B')
axes[1].legend()

plt.tight_layout()
plt.savefig('plot_special.png', dpi=100)
print("Saved: plot_special.png")
plt.close()

print("\nGenerated plots saved: plot_sine.png, plot_grid.png, plot_special.png")
