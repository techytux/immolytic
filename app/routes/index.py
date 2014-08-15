from app import app
from flask.ext.restful import Api, Resource

from flask import jsonify
import logging
from logging.handlers import RotatingFileHandler
import json, datetime
from bson import objectid
from flask import flash

import urllib2
from flask_oauth import OAuth

api = Api(app)
app.secret_key = 'helloworld'

@app.route('/')
def root():
    return app.send_static_file('index.html')

CONSUMER_KEY = ''
CONSUMER_SECRET = ''

OAUTH_TOKEN = 'HackathonKey'
OAUTH_SECRET = 'tq1xxWyMgUBsP6SddSwy'

oauth = OAuth()


is24_oauth = oauth.remote_app('is24',
    base_url='https://rest.immobilienscout24.de/restapi/api/',
    request_token_url='http://rest.immobilienscout24.de/restapi/security/oauth/request_token',
    access_token_url='http://rest.immobilienscout24.de/restapi/security/oauth/access_token',
    authorize_url='http://rest.immobilienscout24.de/restapi/security/oauth/confirm_access?oauth_token=',
    consumer_key=CONSUMER_KEY,
    consumer_secret=CONSUMER_SECRET)


@is24_oauth.tokengetter
def get_is24_oauth_token():
    return (OAUTH_TOKEN, OAUTH_SECRET)


def get_search():
    realestatetype = 'apartmentrent'
    geocodes = 1276
    search_url = 'http://rest.immobilienscout24.de/restapi/api/search/v1.0/search/region?realestatetype=apartmentrent&geocodes=1276'
    header = {'Accept': 'application/json'}

    resp = is24_oauth.get(search_url,headers=header)

    if resp.status == 200:
        print "************SOMETHING*********"
    return resp.data


class Search(Resource):
    def get(self):
        get_search_result = get_search()
        return jsonify({"result":get_search_result})

api.add_resource(Search, '/search')





