"""
Test script to get a valid auth token and test AI endpoints.

Usage:
    python test_auth.py
"""

import os
from dotenv import load_dotenv
from supabase import create_client
import requests
import json

load_dotenv()

# Initialize Supabase client
supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"]
)

# Option 1: Sign in with email/password to get token
def get_token_via_login(email: str, password: str) -> str:
    """Login with credentials and return access token."""
    # Note: This uses the service key client, so we need to use the admin auth
    # For testing, you can manually login via mobile app and copy token instead
    print("For security, get token from mobile app instead.")
    print("See Option 2 below.")
    return None

# Option 2: Create a test user token (admin method)
def get_test_user_token() -> str:
    """
    Get token for testing. Replace with your actual user ID.
    You can find user IDs in your Supabase dashboard under Authentication > Users.
    """
    # Query users table to get a test user ID
    response = supabase.table("users").select("id").limit(1).execute()

    if not response.data:
        print("❌ No users found in database. Create a user via mobile app first.")
        return None

    user_id = response.data[0]["id"]
    print(f"✅ Found user: {user_id}")

    # Generate a token for this user (admin access)
    # Note: This is for testing only. In production, tokens come from auth.signIn()
    user_response = supabase.auth.admin.get_user(user_id)
    print(f"✅ User email: {user_response.user.email}")

    print("\n⚠️  To get a valid session token, you need to:")
    print("1. Login via mobile app")
    print("2. Add console.log to getAuthToken() function")
    print("3. Copy the token from console")
    print("\nOR use the /docs endpoint with your email/password")

    return None

# Test AI endpoint with token
def test_ai_endpoint(token: str):
    """Test the compare endpoint with auth token."""
    url = "http://localhost:8000/ai/compare/claude"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    payload = {
        "players": "4046:8183",  # Example player IDs
        "league_id": "1056967281268809728",  # Your league ID
        "week": 17,
        "season": 2025
    }

    print(f"\n🔍 Testing {url}")
    print(f"Headers: {headers}")

    response = requests.post(url, headers=headers, json=payload)

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ SUCCESS! AI endpoint returned:")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"❌ FAILED: {response.text}")

if __name__ == "__main__":
    print("=" * 60)
    print("AUTH TOKEN TEST SCRIPT")
    print("=" * 60)

    # Try to get a user
    get_test_user_token()

    print("\n" + "=" * 60)
    print("MANUAL TESTING INSTRUCTIONS")
    print("=" * 60)
    print("\n1. Get token from mobile app:")
    print("   - Add console.log('TOKEN:', session.access_token) to getAuthToken()")
    print("   - Login to mobile app")
    print("   - Copy token from console")

    print("\n2. Test with curl:")
    print('   curl -X POST http://localhost:8000/ai/compare/claude \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -H "Authorization: Bearer YOUR_TOKEN_HERE" \\')
    print('     -d \'{"players":"4046:8183","league_id":"123","week":17,"season":2025}\'')

    print("\n3. Or use FastAPI docs:")
    print("   - Visit http://localhost:8000/docs")
    print("   - Click 'Authorize' button")
    print("   - Enter: Bearer YOUR_TOKEN_HERE")
    print("   - Test endpoints interactively")

    print("\n" + "=" * 60)
