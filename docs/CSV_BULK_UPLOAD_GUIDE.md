# CSV Bulk Upload Guide - Master Data Management

This guide explains how to use the CSV bulk upload feature to add industries and job designations to the JobGenie MIS system.

## Overview

The Master Data Management page now includes CSV template download and bulk upload functionality for:
- **Industries**: Add multiple industry categories at once
- **Job Designations**: Add multiple job positions with their associated industries and seniority levels

## Features

### Industries Bulk Upload

#### Download Template
1. Navigate to Master Data page (`/mis/settings`)
2. Click on the "Industries" tab
3. Click the "Download Template" button
4. A CSV file named `industries_template.csv` will be downloaded with sample data

#### CSV Format
The industries CSV file requires one column:
- `industry_name` (required): The name of the industry

**Example:**
```csv
industry_name
Banking
Finance & Investment
IT / Software Development
Healthcare
Manufacturing
```

#### Upload CSV
1. Fill in the CSV template with your industry data
2. Click the "Upload CSV" button on the Industries tab
3. Select your CSV file
4. The system will validate and import the data
5. You'll see a success message with the count of imported industries

#### Validation Rules
- Industry name is required and cannot be empty
- Industry names are trimmed of leading/trailing spaces
- Duplicate validation is handled by the database

---

### Job Designations Bulk Upload

#### Download Template
1. Navigate to Master Data page (`/mis/settings`)
2. Click on the "Job Designations" tab
3. Click the "Download Template" button
4. A CSV file named `designations_template.csv` will be downloaded with sample data

#### CSV Format
The designations CSV file requires three columns:
- `designation_name` (required): The name of the job designation
- `industry_name` (required): The industry this designation belongs to (must exist in the Industries table)
- `seniority_level` (required): The seniority level of the designation

**Valid Seniority Levels:**
- Entry Level
- Junior
- Mid Level
- Senior
- Lead
- Principal

**Example:**
```csv
designation_name,industry_name,seniority_level
Senior Software Engineer,IT / Software Development,Senior
Junior Software Engineer,IT / Software Development,Junior
Financial Analyst,Finance & Investment,Mid Level
Business Analyst,Finance & Investment,Mid Level
Senior Banker,Banking,Senior
```

#### Upload CSV
1. Fill in the CSV template with your designation data
2. Make sure all referenced industries exist in the system first
3. Click the "Upload CSV" button on the Job Designations tab
4. Select your CSV file
5. The system will validate and import the data
6. You'll see a success message with the count of imported designations

#### Validation Rules
- All three columns are required
- `industry_name` must match an existing industry in the database (case-insensitive)
- `seniority_level` must be one of the valid values listed above (case-insensitive)
- Designation names are trimmed of leading/trailing spaces

---

## Error Handling

If there are validation errors in your CSV file, the system will:
1. Show an error message
2. Provide details about which rows have errors
3. Not import any data (all-or-nothing approach to prevent partial imports)
4. Log the errors to the browser console for debugging

Common errors:
- **Missing required field**: A row is missing a required column value
- **Industry not found**: The specified industry doesn't exist in the database
- **Invalid seniority level**: The seniority level doesn't match one of the valid options
- **CSV parsing failed**: The CSV file format is invalid

---

## Technical Details

### API Endpoints

#### Industries Bulk Upload
- **Endpoint**: `POST /api/mis/master-data/industries/bulk-upload`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Requires MIS super admin access
- **Request**: Form data with `file` field containing the CSV
- **Response**: JSON with success status and import count

#### Designations Bulk Upload
- **Endpoint**: `POST /api/mis/master-data/designations/bulk-upload`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Requires MIS super admin access
- **Request**: Form data with `file` field containing the CSV
- **Response**: JSON with success status and import count

### Dependencies
- **papaparse**: Used for CSV parsing on both client and server
- **@types/papaparse**: TypeScript definitions for papaparse

### Security
- Both endpoints require authentication
- Only MIS super admins can upload bulk data
- Input validation is performed on all data
- Error logging is implemented for debugging

---

## Best Practices

1. **Start with Industries**: Always upload industries before designations, since designations reference industries
2. **Download the Template**: Use the provided templates to ensure correct formatting
3. **Validate Your Data**: Check your CSV file in a spreadsheet application before uploading
4. **Use Consistent Naming**: Keep industry names consistent between uploads
5. **Case Insensitivity**: The system handles case-insensitive matching for industries and seniority levels
6. **Backup First**: Consider exporting existing data before performing bulk operations

---

## Support

For issues or questions about the CSV bulk upload feature:
1. Check the browser console for detailed error messages
2. Verify your CSV file format matches the templates
3. Ensure you have super admin access
4. Contact the development team if problems persist
