# Troubleshooting Guide for PostgreSQL Visual Explain

If you're experiencing issues with the PostgreSQL Visual Explain plugin, this guide will help you diagnose and fix common problems.

## Common Issues

### 1. Error Messages

If you see an error message when running the plugin, it could be due to one of the following reasons:

#### "EXPLAIN" Error Message

If you see an error message like "Explain error: EXPLAIN" or "Failed to run EXPLAIN command: EXPLAIN", this is likely due to a quirk in how TablePlus handles the EXPLAIN command results.

**Solution:**
- The latest version of the plugin (1.0.1+) includes fixes for this issue and should handle it automatically
- If you're still seeing the error, try these alternatives:
  ```sql
  -- Try with ANALYZE
  EXPLAIN (FORMAT JSON, ANALYZE) SELECT * FROM your_table;
  
  -- Or try with a simpler query
  EXPLAIN (FORMAT JSON) SELECT 1;
  ```
- Make sure your PostgreSQL version supports EXPLAIN (FORMAT JSON) - this is available in PostgreSQL 9.6 and later

#### Other Query Execution Errors

The plugin might be encountering other errors when executing the EXPLAIN query. This can happen if:
- The SQL query is invalid
- The database user doesn't have permission to run EXPLAIN
- The PostgreSQL version doesn't support the specific EXPLAIN options

**Solution:**
- Check the error message displayed in the alert
- Try running the EXPLAIN command directly in the query editor
- Make sure you have the necessary permissions to run EXPLAIN

#### Incorrect Path to UI HTML File

The plugin might not be able to find the UI HTML file. This can happen if the plugin directory structure is incorrect.

**Solution:**
- Make sure the plugin is installed correctly
- Try reinstalling the plugin by double-clicking the `.tableplusplugin.zip` file

#### PostgreSQL EXPLAIN Format Issues

PostgreSQL's EXPLAIN command output format can vary between versions.

**Solution:**
- Check the console logs in TablePlus (if available)
- Try running the EXPLAIN command directly in the query editor to see the output format

### 2. Blank Screen or No Visualization

If the plugin runs but shows a blank screen or no visualization appears, it could be due to:

#### Plan Data Format Issues

The plugin might be having trouble processing the EXPLAIN output format from your PostgreSQL version.

**Solution:**
- The latest version of the plugin (1.0.3+) includes enhanced format handling and should work with most PostgreSQL versions
- Try a simpler query to test if the issue is query-specific
- Check if your PostgreSQL version supports EXPLAIN (FORMAT JSON)
- Try running the query with ANALYZE: `EXPLAIN (FORMAT JSON, ANALYZE) YOUR_QUERY`

#### JSON Parsing Issues

The plugin might be having trouble parsing the EXPLAIN output.

**Solution:**
- Try a simpler query
- Check the console logs in TablePlus (if available) for parsing errors
- Make sure your PostgreSQL version returns valid JSON for EXPLAIN (FORMAT JSON)

#### PEV2 Compatibility Issues

The PEV2 library might not be compatible with the EXPLAIN output format.

**Solution:**
- Try updating to the latest version of the plugin
- Check if your PostgreSQL version is supported (9.6+)

## Debugging Steps

1. **Check PostgreSQL Version**
   - Run `SELECT VERSION();` to verify your PostgreSQL version
   - This plugin is tested with PostgreSQL 10 and above

2. **Verify EXPLAIN Output**
   - Run `EXPLAIN (FORMAT JSON) YOUR_QUERY;` directly in the query editor
   - Make sure it returns valid JSON

3. **Check Plugin Installation**
   - Verify that the plugin is installed in the correct location
   - Try reinstalling the plugin

4. **Restart TablePlus**
   - Sometimes a simple restart of TablePlus can fix issues

## Reporting Issues

If you're still experiencing issues after trying the troubleshooting steps above, please report the issue on the [GitHub repository](https://github.com/jorgemarizan/tableplus-pg-visual-explain/issues) with the following information:

- PostgreSQL version
- TablePlus version
- Operating system
- Steps to reproduce the issue
- Sample query that causes the issue
- Screenshots of the error (if applicable)
