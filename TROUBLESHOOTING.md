# Troubleshooting Guide

## Common API Errors

### 1. JSON Serialization Error
**Error Message:** `Object of type int64 is not JSON serializable`

**Cause:** The API server is using numpy data types (int64, float64) which cannot be directly serialized to JSON.

**Specific Location:** Error occurs at line 347 in `app.py` when calling `jsonify(response_data)`

**Immediate Fix (for API developer):** Add this code before line 347 in `app.py`:
```python
def convert_numpy_types(obj):
    import numpy as np
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    return obj

# Convert before jsonify
response_data = convert_numpy_types(response_data)
return jsonify(response_data)
```

**Dashboard Status:** The dashboard will show: "API server encountered a data processing error. Please try again in a few moments or contact support."

### 2. Connection Errors
**Error Message:** `Cannot connect to API server`

**Solutions:**
1. Ensure API server is running: `python app.py` or your start command
2. Check if localhost:5000 is accessible
3. Verify no firewall blocking the connection
4. Check if port 5000 is already in use

### 3. Invalid Response Format
**Error Message:** `API returned invalid response`

**Solutions:**
1. Check API server logs for errors
2. Verify API is returning correct JSON structure
3. Test API endpoint directly with Postman

## Debug Steps

### For Dashboard Users:
1. **Check API Status:** Look for the API Status Checker in dashboard - should show green ✅
2. **Check Console Logs:** Open browser DevTools → Console to see detailed error logs
3. **Check Raw API Response:** If available, click "Show API Response" to see the actual error
4. **Try Again:** Some errors are temporary, try generating recommendations again

### For Developers:
1. **Check API Server Logs:** Look at the Python server console for detailed error traces
2. **Verify Data Types:** Check if your pandas/numpy operations are returning proper types
3. **Test API Directly:** Use curl or Postman to test the endpoint independently
4. **Check Data Pipeline:** Ensure all data processing steps handle type conversion

## Error Codes Reference

| Error Type | Dashboard Message | Likely Cause | Action |
|------------|------------------|--------------|---------|
| JSON Serialization | "API server encountered a data processing error" | Numpy types in response | Contact API developer |
| Connection Failed | "Cannot connect to AI API" | Server not running | Start API server |
| Invalid Response | "AI API returned invalid response" | Malformed API response | Check API logs |
| No Data | "No suitable influencers found" | No matches for criteria | Adjust campaign parameters |

## Contact Support

If errors persist:
1. Copy the error message from console logs
2. Include your campaign brief details
3. Note the exact time the error occurred
4. Provide browser and OS information

For API developers:
- Check server logs for detailed stack traces
- Verify all numpy/pandas operations convert to native Python types
- Test with small datasets first
- Use proper JSON encoding for numpy types
