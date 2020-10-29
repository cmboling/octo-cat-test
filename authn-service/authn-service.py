from flask import Flask, g, redirect, request, abort, session, url_for
from flask_cors import CORS

import requests
import jwt
from datetime import datetime, timedelta, timezone

app = Flask(__name__)
CORS(app)

CLIENT_ID = "aad2f5434c1efdb25ce6"
CLIENT_SECRET = "0811f5c320f0fddce277bb8bec386a0e1e044589"

def get_access_token(code):
    app.logger.debug('Requesting access token')
    r = requests.post('https://github.com/login/oauth/access_token', json={
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code,
        'redirect_uri': 'http://localhost:8080/login/callback',
        'state': 'NotSoRandom'
    }, headers={
        'Accept': 'application/json'
    })

    app.logger.debug('Received response %s with status %d', r.json(), r.status_code)
    data = r.json()

    if 'error' in data:
        return (None, data['error_description'])

    return ({'access_token': data['access_token'], 'scope': data['scope'], 'token_type': data['token_type']}, None)

def get_user_profile(access_token):
    app.logger.debug('Request user profile')
    r = requests.get('https://api.github.com/user', headers={
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': f'Bearer {access_token}'
    })

    app.logger.debug('Received response %s with status %d', r.json(), r.status_code)
    data = r.json()

    if 'error' in data:
        return (None, data['error_description'])
    
    return (data, None)

@app.route("/authenticate/<code>")
def authenticate(code):
    app.logger.debug("Received authentication request with code: %s", code)
    access_info, error = get_access_token(code)

    if error:
        return {'error': error}

    profile, error = get_user_profile(access_info['access_token'])
    if error:
        return {'error': error}
    
    claimset = {
        'iss': "OctoGallery",
        'iat': int(datetime.now(timezone.utc).timestamp()),
        'exp': int((datetime.now(timezone.utc) + timedelta(days=1)).timestamp()),
        'profile': {k:v for k, v in profile.items() if k in ['login', 'name', 'email']}
    }
    app.logger.debug("Created claimset: %s", claimset)

    token = jwt.encode(claimset, 'secret', algorithm='HS256')

    return {'token': token.decode()}