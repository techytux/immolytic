import requests
from requests_oauthlib import OAuth1

client_key = 'HackathonKey'
client_secret = 'tq1xxWyMgUBsP6SddSwy'
resource_owner_key = ''
resource_owner_secret = ''
IS24_OAUTH = OAuth1(client_key,
              client_secret=client_secret,
              resource_owner_key=resource_owner_key,
              resource_owner_secret=resource_owner_secret)
