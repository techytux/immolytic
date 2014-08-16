#!/usr/bin/python

import json, requests
from is24api import IS24_OAUTH
import random
import pandas as pd

crawled_data_filename = 'crawled_data.json'
price_trends_filename = 'price_trends.json'
wishlist_filename = 'aggregated_wishlist_crawled_exposes.csv'

crawled_data = []

def get_compiled_district(district_name):
    with open('district_mapper.json') as datafile:
        district_mapper = json.load(datafile)
    compiled_district_name = district_mapper[district_name]
    return compiled_district_name

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
        urls.append({'url': url, 'district_name': item['name'], 'geocode': item['geocode']})
    
    urls.pop(0)
    return urls

def crawler(url, district_name, geocode):
    print '***** Making request %s *****' % url
    headers = {'Accept': 'application/json'}
    r = requests.get(url=url, auth=IS24_OAUTH, headers=headers)

    json_result = r.json()
    data = get_property_data(json_result, district_name, geocode)
    if data:
        crawled_data.append(data)

    if 'next' in json_result['resultlist.resultlist']['paging'].keys():
        next_url = json_result['resultlist.resultlist']['paging']['next']['@xlink.href']
        crawler(next_url, district_name, geocode)

def get_property_data(json_result, district_name, geocode):
    property_dict = {}
    for resultentries in json_result['resultlist.resultlist']['resultlistEntries']:
        for property_item in resultentries['resultlistEntry']:
            if(isinstance(property_item, dict)):
                try:
                    if 'street' in property_item['resultlist.realEstate']['address'].keys():
                        property_dict['street'] = property_item['resultlist.realEstate']['address']['street']
                    else:
                        property_dict['street'] = 'NA'
                    
                    if property_item['resultlist.realEstate']['builtInKitchen'] == 'true':
                        property_dict['built_in_kitchen'] = 1
                    else:
                        property_dict['built_in_kitchen'] = 0
                    
                    if property_item['resultlist.realEstate']['balcony'] == 'true':
                        property_dict['balcony'] = 1
                    else:
                        property_dict['balcony'] = 0
                    property_dict['id'] = property_item['realEstateId']
                    property_dict['city'] = property_item['resultlist.realEstate']['address']['city']
                    property_dict['quarter'] = property_item['resultlist.realEstate']['address']['quarter']
                    property_dict['postcode'] = property_item['resultlist.realEstate']['address']['postcode']
                    property_dict['price'] = property_item['resultlist.realEstate']['price']['value']
                    property_dict['floor_space'] = property_item['resultlist.realEstate']['livingSpace']
                    property_dict['district_name'] = district_name
                    property_dict['geocode'] = geocode
                    property_dict['household_income'] = random.randrange(20, 200) * 1000
                    property_dict['compiled_district_name'] = get_compiled_district(district_name)
                    property_dict['number_of_rooms'] = property_item['resultlist.realEstate']['numberOfRooms']
     
                except KeyError, e:
                    print 'Caught key error %s' % e
            else:
                print type(property_item), property_item    
    return property_dict


def get_price_trend(districts):
    results = []
    for district in districts:
        geocode = str(district['geocode'])
        name = str(district['name'])
        if len(geocode) == 13:
            region = geocode[4:7]
            city = geocode[7:10]
            district = geocode[10:13]
            url = 'https://rest.immobilienscout24.de/restapi/api/ibw/v2.0/pricetrend/region/%s/city/%s/district/%s/?realEstateType=0&firstTimeUse=' % (region, city, district)
            headers = {'Accept': 'application/json'}
            req = requests.get(url=url, auth=IS24_OAUTH, headers=headers)
            try:
                last_price = req.json()['avgOfferingPrice'][-1:][0]['avgPrice']
                last_quarter = req.json()['avgOfferingPrice'][-1:][0]['quarterOfYear']
            except:
                last_price = req.json()['avgOfferingPrice'][-2:-1][0]['avgPrice']
                last_quarter = req.json()['avgOfferingPrice'][-2:-1][0]['quarterOfYear']
            percentual_change = req.json()['percentualChange']
            trend = req.json()['avgOfferingPrice']
            results.append({
                'name': name,
                'geocode': geocode,
                'last_quarter': last_quarter,
                'last_price': last_price,
                'percentual_change': percentual_change,
                'trend': trend
                })
    return results


def merge_rent_prices(crawled_data, rent_price_trends):
    crawled_data_df = pd.read_json(crawled_data)
    rent_price_trends_df = pd.read_json(rent_price_trends)
    rent_price_trends_df = rent_price_trends_df.rename(columns={'last_price': 'avg_montly_rental_price_sq'})
    new_df = pd.merge(crawled_data_df, rent_price_trends_df[['geocode', 'avg_montly_rental_price_sq']], how='left', on='geocode')
    new_df['avg_anual_rental_price_sq'] = new_df['avg_montly_rental_price_sq'].apply(lambda x: float(x) * 12)
    new_df['buy_price_sq'] = new_df['price'].astype(float) / new_df['floor_space'].astype(float)
    return new_df


def merge_wishlist(crawled_data, wishlist_file):
    wishlist_df = pd.read_csv(wishlist_file, sep=',')
    wishlist_df = wishlist_df.rename(columns={
        'counter':'added_to_wishlist',
        'contacted_counter': 'contacted_realtor'})
    new_df = pd.merge(crawled_data, wishlist_df, how='left', left_on='id', right_on='exposeId')
    new_df = new_df.drop('exposeId', axis=1)
    new_df['added_to_wishlist'] = new_df['added_to_wishlist'].fillna(0)
    new_df['contacted_realtor'] = new_df['contacted_realtor'].fillna(0)
    return new_df


if __name__ == '__main__':
    districts = get_districts('geocodes.json')
    urls = get_urls(districts)
    for url in urls:
        crawler(url['url'], url['district_name'], url['geocode'])

    price_trends = get_price_trend(districts)

    with open(crawled_data_filename, 'w') as datafile:
        json.dump(crawled_data, datafile)

    with open(price_trends_filename, 'w') as price_file:
        json.dump(price_trends, price_file)

    new_crawled_data = merge_rent_prices(crawled_data_filename, price_trends_filename)
    new_crawled_data = merge_wishlist(new_crawled_data, wishlist_filename)

    new_crawled_data.to_json(crawled_data_filename, orient='records')
