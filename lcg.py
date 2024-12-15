import math
import random

def generate_lcg_numbers_in_increasing_order(size, min_val, max_val, a=1664525, c=1013904223, m=2 ** 32):
    # Use math.random for seed initialization
    seed = int(random.random() * m)
    random_numbers = []
    current = seed
    for _ in range(size):
        current = (a * current + c) % m
        random_number = (current / m * (max_val - min_val + 1)) + min_val
        random_numbers.append(int(random_number))
    
    # Ensure the numbers are sorted in increasing order
    random_numbers.sort()
    return random_numbers

# Example usage:
random_range_list = generate_lcg_numbers_in_increasing_order(25, 1, 500)
print(random_range_list)
