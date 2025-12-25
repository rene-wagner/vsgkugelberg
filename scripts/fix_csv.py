#!/usr/bin/env python3
"""
Script to fix CSV file with unintended line breaks in HTML content.
Reconstructs proper CSV records by joining lines that belong to the same record.
"""

import csv
import sys
import re
from io import StringIO

def fix_csv_line_breaks(input_file, output_file):
    """
    Fix CSV file by removing unintended line breaks within quoted fields.
    
    Args:
        input_file: Path to input CSV file
        output_file: Path to output CSV file
    """
    print(f"Reading input file: {input_file}")
    
    # Read all lines from input file
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"Total lines read: {len(lines)}")
    
    # Reconstruct CSV records
    fixed_records = []
    current_record = []
    in_quoted_field = False
    quote_count = 0
    records_processed = 0
    
    for i, line in enumerate(lines):
        line = line.rstrip('\n')
        
        # Check if this line starts a new record (ID pattern)
        if re.match(r'^\d+,', line):
            # If we have a current record, save it first
            if current_record:
                fixed_records.append(''.join(current_record))
                records_processed += 1
            
            # Start new record
            current_record = [line]
            quote_count = line.count('"')
            in_quoted_field = quote_count % 2 == 1
            
        else:
            # This is a continuation line
            current_record.append(' ' + line)  # Add space to maintain HTML spacing
            quote_count += line.count('"')
            in_quoted_field = quote_count % 2 == 1
        
        # Progress indicator
        if (i + 1) % 10000 == 0:
            print(f"Processed {i + 1} lines...")
    
    # Don't forget the last record
    if current_record:
        fixed_records.append(''.join(current_record))
        records_processed += 1
    
    print(f"Reconstructed {records_processed} records")
    
    # Write fixed records to output file
    print(f"Writing to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        for record in fixed_records:
            f.write(record + '\n')
    
    print("CSV fix completed successfully!")
    return records_processed

def validate_csv(file_path):
    """
    Validate that the CSV file is properly formatted.
    
    Args:
        file_path: Path to CSV file to validate
    """
    print(f"Validating CSV file: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            row_count = 0
            error_count = 0
            
            for row_num, row in enumerate(reader, 1):
                row_count += 1
                
                # Check if row has expected number of columns
                if len(row) < 5:  # Minimum expected columns
                    print(f"Warning: Row {row_num} has only {len(row)} columns")
                    error_count += 1
                
                # Progress indicator
                if row_num % 100 == 0:
                    print(f"Validated {row_num} rows...")
            
            print(f"Validation complete: {row_count} rows processed")
            if error_count > 0:
                print(f"Found {error_count} potential issues")
            else:
                print("CSV validation passed - no issues found!")
                
            return row_count, error_count
            
    except Exception as e:
        print(f"Error validating CSV: {e}")
        return 0, 1

def main():
    if len(sys.argv) != 3:
        print("Usage: python fix_csv.py <input_file> <output_file>")
        print("Example: python fix_csv.py posts.csv posts_fixed.csv")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    try:
        # Fix the CSV
        records_processed = fix_csv_line_breaks(input_file, output_file)
        
        # Validate the fixed CSV
        row_count, error_count = validate_csv(output_file)
        
        print(f"\nSummary:")
        print(f"- Records processed: {records_processed}")
        print(f"- Rows in output: {row_count}")
        print(f"- Validation errors: {error_count}")
        print(f"- Input file size: {len(open(input_file, 'rb').read()):,} bytes")
        print(f"- Output file size: {len(open(output_file, 'rb').read()):,} bytes")
        
        if error_count == 0:
            print("✅ CSV fix completed successfully!")
        else:
            print("⚠️  CSV fix completed with some issues - please review")
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()