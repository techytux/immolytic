#!/usr/bin/python

import json, requests
from is24api import IS24_OAUTH
import time

crawled_data = []
def get_districts(filename):
    districts = []
    with open(filename, 'r') as datafile:
        data = json.load(datafile)
    for region in data['region.regions'][0]['region']:
        temp_dict = {
            'name': region['name'].encode('utf8'),
            'geocode': region['geoCodeId']
        }
        districts.append(temp_dict)
    return districts

def get_urls(districts):
    urls = []
    for item in districts:
        url = 'http://rest.immobilienscout24.de/restapi/api/search/v1.0/search/region?realestatetype=ApartmentBuy&geocodes=%s' % item['geocode']
        urls.append(url)
    
    urls.pop(0)
    return urls

def crawler(url):
    print '***** Making request %s *****' % url
    headers = {'Accept': 'application/json'}
    r = requests.get(url=url, auth=IS24_OAUTH, headers=headers)

    json_result = r.json()
    time.sleep(2)

    crawled_data.append(get_property_data(json_result))

    if 'next' in json_result['resultlist.resultlist']['paging'].keys():
        next_url = json_result['resultlist.resultlist']['paging']['next']['@xlink.href']
        # print next_url
        crawler(next_url)

    

def get_property_data(json_result):
    property_dict = {}
    for resultentries in json_result['resultlist.resultlist']['resultlistEntries']:
        for property_item in resultentries['resultlistEntry']:
            if(isinstance(property_item, dict)):
                # print property_item
                try:
                    property_dict['id'] = property_item['realEstateId']
                    property_dict['city'] = property_item['resultlist.realEstate']['address']['city']
                    property_dict['quarter'] = property_item['resultlist.realEstate']['address']['city']
                    property_dict['price'] = property_item['resultlist.realEstate']['price']['value']
                    property_dict['floor_space'] = property_item['resultlist.realEstate']['livingSpace']
                except KeyError, e:
                    print 'Caught key error'
            else:
                print type(property_item), property_item    
    return property_dict

if __name__ == '__main__':
    districts = get_districts('geocodes.json')
    urls = get_urls(districts)
    print urls[0]
    print crawler(urls[0])
    for url in urls:
        print '***** Making request %s *****' % url
        crawler(url)

    with open('crawled_data.json', 'w') as datafile:
        json.dump(crawled_data, datafile)

