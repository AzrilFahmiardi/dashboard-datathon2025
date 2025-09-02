# URGENT: API Server JSON Serialization Fix

## Problem Confirmed
Error masih terjadi di line 347 dalam `app.py` meskipun payload format sudah sesuai Postman collection.

**Root Cause:** Numpy data types (int64, float64) dalam response_data tidak bisa di-serialize ke JSON.

## IMMEDIATE FIX (Copy-paste ini ke app.py)

### Option 1: Quick Fix (Recommended)
Tambahkan code ini **TEPAT SEBELUM line 347** di `app.py`:

```python
import numpy as np

def convert_numpy_to_python(obj):
    """Convert numpy types to native Python types recursively"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_to_python(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_to_python(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_to_python(item) for item in obj)
    elif hasattr(obj, 'item'):  # numpy scalar
        return obj.item()
    return obj

# Replace line 347 from:
# return jsonify(response_data)
# To:
response_data = convert_numpy_to_python(response_data)
return jsonify(response_data)
```

### Option 2: Flask JSON Encoder (Global Fix)
Tambahkan di bagian atas `app.py` setelah import Flask:

```python
import json
import numpy as np
from flask.json import JSONEncoder

class NumpyJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif hasattr(obj, 'item'):
            return obj.item()
        return super(NumpyJSONEncoder, self).default(obj)

# Set the custom encoder
app.json_encoder = NumpyJSONEncoder
```

### Option 3: One-liner Quick Fix
Replace line 347 dengan:

```python
import json
import numpy as np
return app.response_class(
    response=json.dumps(response_data, default=lambda x: int(x) if isinstance(x, np.integer) else float(x) if isinstance(x, np.floating) else x.tolist() if isinstance(x, np.ndarray) else x.item() if hasattr(x, 'item') else str(x)),
    status=200,
    mimetype='application/json'
)
```

## Why This Happens
1. **CBC Optimization Solver** returns numpy.int64 values
2. **Pandas operations** create numpy data types
3. **Score calculations** might return numpy arrays
4. **Flask jsonify()** cannot handle numpy types

## Files to Check in API Server
Look for numpy operations in:
- Optimization results processing
- Score calculations 
- Any pandas operations
- Data aggregations

## Testing After Fix
1. Restart API server
2. Test with dashboard or run: `node test-api-format.js`
3. Should return valid JSON without serialization error

## Verification
Dashboard payload format is CORRECT and matches Postman collection exactly. The issue is 100% in API server JSON serialization.
