from app import app
from flask.ext.restful import Api, Resource
from flask import jsonify
import logging
from logging.handlers import RotatingFileHandler
import requests
from is24api import IS24_OAUTH

api = Api(app)
app.secret_key = 'is24hacksecret'

@app.route('/')
def root():
    return app.send_static_file('index.html')

class Search(Resource):
    def get(self):
        url = 'http://rest.immobilienscout24.de/restapi/api/search/v1.0/search/region?realestatetype=apartmentrent&geocodes=1276'


        headers = {'Accept': 'application/json'}
        r = requests.get(url=url, auth=IS24_OAUTH, headers=headers)
        return r.json()

api.add_resource(Search, '/search')
