#!/usr/bin/env python3
"""
CORS Fix Script for Sweet Shop Management System
Helps diagnose and fix CORS issues between frontend and backend
"""

import requests
import json
import sys
from urllib.parse import urlparse

# Configuration
BACKEND_URL = "https://sweet-karma-shop.onrender.com"
FRONTEND_URL = "https://sweet-karma-shop-8xmg.vercel.app"
API_BASE_URL = f"{BACKEND_URL}/api"

def test_endpoint(name, url, method="GET", headers=None):
    """Test a specific endpoint and return results."""
    if headers is None:
        headers = {}
    
    print(f"🧪 Testing {name}...")
    try:
        response = requests.request(method, url, headers=headers, timeout=10)
        print(f"✅ {name}: {response.status_code} ({len(response.content)} bytes)")
        
        # Check for CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        
        if any(cors_headers.values()):
            print(f"   CORS Headers: {cors_headers}")
        
        return True, response.status_code, response.headers
        
    except requests.exceptions.RequestException as e:
        print(f"❌ {name}: {str(e)}")
        return False, None, None

def test_cors_preflight(url, origin):
    """Test CORS preflight request."""
    print(f"🔍 Testing CORS preflight for {origin}...")
    headers = {
        'Origin': origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
    }
    
    try:
        response = requests.options(url, headers=headers, timeout=10)
        print(f"✅ CORS Preflight: {response.status_code}")
        
        allowed_origin = response.headers.get('Access-Control-Allow-Origin')
        if allowed_origin:
            if allowed_origin == '*' or allowed_origin == origin:
                print(f"✅ Origin allowed: {allowed_origin}")
                return True
            else:
                print(f"❌ Origin not allowed. Got: {allowed_origin}, Expected: {origin}")
                return False
        else:
            print("❌ No Access-Control-Allow-Origin header found")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ CORS Preflight failed: {str(e)}")
        return False

def generate_cors_config():
    """Generate the correct CORS configuration."""
    origins = [
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:3000",
        FRONTEND_URL,
        "https://sweet-karma-shop-frontend.vercel.app",
        "https://sweet-karma-shop-frontend.netlify.app",
        "https://sweet-karma-shop.vercel.app",
        "https://sweet-karma-shop.netlify.app"
    ]
    
    return ",".join(origins)

def main():
    """Main function to run all tests and provide solutions."""
    print("🍬 Sweet Shop CORS Fix Tool")
    print("=" * 50)
    print(f"Frontend URL: {FRONTEND_URL}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base URL: {API_BASE_URL}")
    print()
    
    # Test basic connectivity
    print("📡 Testing Basic Connectivity:")
    health_ok, _, _ = test_endpoint("Backend Health", f"{BACKEND_URL}/health")
    root_ok, _, _ = test_endpoint("Backend Root", f"{BACKEND_URL}/")
    api_ok, _, _ = test_endpoint("API Sweets", f"{API_BASE_URL}/sweets")
    
    print()
    
    # Test CORS
    print("🔒 Testing CORS Configuration:")
    cors_ok = test_cors_preflight(f"{API_BASE_URL}/sweets", FRONTEND_URL)
    
    print()
    print("📊 Results Summary:")
    print(f"   Backend Health: {'✅' if health_ok else '❌'}")
    print(f"   Backend Root: {'✅' if root_ok else '❌'}")
    print(f"   API Endpoint: {'✅' if api_ok else '❌'}")
    print(f"   CORS Configuration: {'✅' if cors_ok else '❌'}")
    
    print()
    
    if not cors_ok:
        print("🔧 CORS FIX NEEDED!")
        print("Your backend needs to be updated with the following CORS configuration:")
        print()
        print("Environment Variable to set on Render:")
        print("ALLOWED_ORIGINS=" + generate_cors_config())
        print()
        print("Steps to fix:")
        print("1. Go to https://dashboard.render.com")
        print("2. Find your 'sweet-karma-shop' service")
        print("3. Go to Environment tab")
        print("4. Update ALLOWED_ORIGINS with the value above")
        print("5. Save and redeploy")
        print()
        print("Alternative: Temporarily set ALLOWED_ORIGINS=* for testing (NOT for production)")
    else:
        print("✅ CORS is configured correctly!")
        print("If you're still having issues, check:")
        print("1. Browser console for JavaScript errors")
        print("2. Network tab for failed requests")
        print("3. Frontend environment variables")
    
    print()
    print("🔍 Debug Tools:")
    print(f"1. Open debug tool: {FRONTEND_URL}/debug-connection.html")
    print("2. Check browser console (F12)")
    print("3. Test backend directly: " + BACKEND_URL)

if __name__ == "__main__":
    main()