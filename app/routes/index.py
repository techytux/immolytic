from app import app
from flask.ext.restful import Api, Resource
from flask import jsonify
import logging
from logging.handlers import RotatingFileHandler
import requests, json
from is24api import IS24_OAUTH
from crossdomain import *
from flask import Response


api = Api(app)
app.secret_key = 'is24hacksecret'

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def get_resource(path):  # pragma: no cover
    mimetypes = {
        ".css": "text/css",
        ".html": "text/html",
        ".js": "application/javascript",
    }
    complete_path = os.path.join(root_dir(), path)
    ext = os.path.splitext(path)[1]
    mimetype = mimetypes.get(ext, "text/html")
    content = get_file(complete_path)
    return Response(content, mimetype=mimetype)

@app.route('/search', methods=['GET'])
@crossdomain(origin='*')
def search():
    with open('app/crawler/crawled_data.json', 'r') as datafile:
        data = json.load(datafile)
        return jsonify({'results': data})

@app.route('/pricetrends', methods=['GET'])
@crossdomain(origin='*')
def pricetrends():
    with open('app/crawler/price_trends.json', 'r') as datafile:
        data = json.load(datafile)
        return jsonify({'results': data})
