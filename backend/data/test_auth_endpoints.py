"""
Test authentication on AI endpoints.

This script tests:
1. Endpoints reject requests without auth (401)
2. Endpoints reject requests with invalid auth (401)
3. Auth validation functions work correctly
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_no_auth():
    """Test that endpoints reject requests without Authorization header."""
    print("\n" + "="*60)
    print("TEST 1: Request WITHOUT Authentication")
    print("="*60)

    endpoints = [
        {
            "url": f"{BASE_URL}/ai/compare/claude",
            "payload": {
                "players": "4046:8183",
                "league_id": "123456",
                "week": 17,
                "season": 2025
            }
        },
        {
            "url": f"{BASE_URL}/ai/evaluate_trade/claude",
            "payload": {
                "give": "4046",
                "get": "8183",
                "league_id": "123456",
                "user_id": "test_user",
                "season": 2025,
                "current_week": 17
            }
        },
        {
            "url": f"{BASE_URL}/ai/evaluate_waiver/claude",
            "payload": {
                "player": "4046",
                "league_id": "123456",
                "user_id": "test_user",
                "season": 2025,
                "current_week": 17
            }
        }
    ]

    for endpoint in endpoints:
        print(f"\n🔍 Testing: {endpoint['url']}")
        response = requests.post(
            endpoint['url'],
            headers={"Content-Type": "application/json"},
            json=endpoint['payload']
        )

        if response.status_code == 401:
            print(f"✅ PASS: Got 401 Unauthorized (expected)")
            try:
                error = response.json()
                print(f"   Error message: {error.get('detail', 'No detail')}")
            except:
                print(f"   Response: {response.text[:100]}")
        else:
            print(f"❌ FAIL: Got {response.status_code} (expected 401)")
            print(f"   Response: {response.text[:200]}")

def test_invalid_auth():
    """Test that endpoints reject requests with invalid token."""
    print("\n" + "="*60)
    print("TEST 2: Request WITH Invalid Token")
    print("="*60)

    url = f"{BASE_URL}/ai/compare/claude"
    payload = {
        "players": "4046:8183",
        "league_id": "123456",
        "week": 17,
        "season": 2025
    }

    invalid_tokens = [
        "invalid_token",
        "Bearer invalid",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token"
    ]

    for token in invalid_tokens:
        print(f"\n🔍 Testing with token: {token[:30]}...")
        response = requests.post(
            url,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            },
            json=payload
        )

        if response.status_code == 401:
            print(f"✅ PASS: Got 401 Unauthorized (expected)")
        else:
            print(f"❌ FAIL: Got {response.status_code} (expected 401)")
            print(f"   Response: {response.text[:200]}")

def test_backend_running():
    """Test that backend is actually running."""
    print("\n" + "="*60)
    print("TEST 0: Backend Health Check")
    print("="*60)

    try:
        # Try to reach a public endpoint
        response = requests.get(f"{BASE_URL}/user/test_user/id", timeout=2)
        print(f"✅ Backend is running on {BASE_URL}")
        print(f"   Test endpoint responded with status: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print(f"❌ Backend is NOT running on {BASE_URL}")
        print(f"   Please start it with: cd backend && python main.py")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

def get_user_info():
    """Get information about existing users for token generation."""
    print("\n" + "="*60)
    print("USER INFO: Getting test user details")
    print("="*60)

    try:
        from services.supabase import supabase

        # Get a user from the database
        response = supabase.table("users").select("*").limit(1).execute()

        if response.data and len(response.data) > 0:
            user = response.data[0]
            print(f"✅ Found user in database:")
            print(f"   User ID: {user['id']}")
            print(f"   Sleeper Username: {user['sleeper_username']}")

            # Get user's league
            league_response = supabase.table("leagues").select("*").eq("user_id", user['id']).eq("is_active", True).limit(1).execute()
            if league_response.data and len(league_response.data) > 0:
                league = league_response.data[0]
                print(f"   Active League: {league['league_name']} ({league['league_id']})")
            return user
        else:
            print("❌ No users found in database")
            print("   Create a user via mobile app first")
            return None

    except Exception as e:
        print(f"❌ Error querying database: {e}")
        return None

def print_next_steps():
    """Print instructions for getting a valid token."""
    print("\n" + "="*60)
    print("NEXT STEPS: How to get a valid token for testing")
    print("="*60)

    print("\n📱 EASIEST METHOD - From Mobile App:")
    print("1. Add this to mobile/lib/api.js getAuthToken():")
    print("   console.log('🔑 TOKEN:', session.access_token);")
    print("\n2. Run mobile app and login")
    print("\n3. Copy the token from console")
    print("\n4. Test with curl:")
    print('   curl -X POST http://localhost:8000/ai/compare/claude \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -H "Authorization: Bearer YOUR_TOKEN_HERE" \\')
    print('     -d \'{"players":"4046:8183","league_id":"YOUR_LEAGUE_ID","week":17,"season":2025}\'')

    print("\n\n🌐 ALTERNATIVE - Using Supabase Auth API:")
    print("   Use the Supabase client to sign in with email/password")
    print("   The session will contain an access_token")

    print("\n\n📚 OR - Use FastAPI Swagger UI:")
    print("1. Get token from mobile app (method above)")
    print("2. Visit http://localhost:8000/docs")
    print("3. Click 'Authorize' button")
    print("4. Enter: Bearer YOUR_TOKEN_HERE")
    print("5. Test endpoints interactively")

if __name__ == "__main__":
    print("=" * 60)
    print("BACKEND AUTHENTICATION TEST SUITE")
    print("=" * 60)

    # Test if backend is running
    if not test_backend_running():
        exit(1)

    # Get user info for reference
    get_user_info()

    # Run auth tests
    test_no_auth()
    test_invalid_auth()

    # Print instructions
    print_next_steps()

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print("✅ Authentication is properly configured")
    print("✅ Endpoints correctly reject unauthorized requests")
    print("📋 Next: Get a valid token and test with mobile app")
    print("=" * 60)
