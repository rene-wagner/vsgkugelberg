#!/usr/bin/env python3
"""
Simple validation script for the fixed CSV file.
"""

import csv
import sys

def validate_csv_simple(file_path):
    """Validate CSV structure without field size limits."""
    print(f"Validating: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # Increase field size limit
            csv.field_size_limit(1000000)
            reader = csv.reader(f)
            
            row_count = 0
            col_counts = set()
            
            for row in reader:
                row_count += 1
                col_counts.add(len(row))
                
                if row_count % 100 == 0:
                    print(f"Processed {row_count} rows...")
            
            print(f"\nValidation Results:")
            print(f"- Total rows: {row_count}")
            print(f"- Column counts found: {sorted(col_counts)}")
            
            if len(col_counts) == 1:
                print("✅ All rows have consistent column count!")
            else:
                print("⚠️  Inconsistent column counts detected!")
            
            return True
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    file_path = sys.argv[1] if len(sys.argv) > 1 else "posts_fixed.csv"
    validate_csv_simple(file_path)