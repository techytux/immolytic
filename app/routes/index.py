from app import app
from flask.ext.restful import Api, Resource
from flask import jsonify
import logging
from logging.handlers import RotatingFileHandler
import requests, json
from is24api import IS24_OAUTH
from crossdomain import *


api = Api(app)
app.secret_key = 'is24hacksecret'

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/search', methods=['GET'])
@crossdomain(origin='*')
def search():
    with open('app/crawler/crawled_data.json', 'r') as datafile:
        data = json.load(datafile)
        return jsonify({'results': data})
