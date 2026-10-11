import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from geolocation import CityLookup


class Reader:
    def __init__(self, record):
        self.record = record
        self.lookups = []

    def get(self, address):
        self.lookups.append(address)
        return self.record


class LocationTests(unittest.TestCase):
    def test_local_lookup_returns_only_approximate_city(self):
        reader = Reader({'city': {'names': {'zh-CN': '大连', 'en': 'Dalian'}}, 'country': {'names': {'zh-CN': '中国'}}, 'location': {'latitude': 38.914, 'longitude': 121.614}})
        result = CityLookup(reader=reader).locate('1.1.1.1')
        self.assertEqual(reader.lookups, ['1.1.1.1'])
        self.assertEqual(result['city'], '大连')
        self.assertEqual((result['latitude'], result['longitude']), (38.9, 121.6))
        self.assertEqual(set(result), {'available', 'city', 'country', 'latitude', 'longitude', 'approximate', 'source'})
        self.assertNotIn('1.1.1.1', str(result))

    def test_private_invalid_or_uncovered_addresses(self):
        reader = Reader(None)
        lookup = CityLookup(reader=reader)
        for address in ['127.0.0.1', '192.168.1.1', '::1', 'nonsense', '']:
            self.assertEqual(lookup.locate(address), {'available': False})
        self.assertEqual(reader.lookups, [])
        self.assertEqual(lookup.locate('1.1.1.1'), {'available': False})
        self.assertEqual(CityLookup().locate('1.1.1.1'), {'available': False})

    def test_bad_coordinates_are_not_fabricated(self):
        for coords in [{'latitude': 91, 'longitude': 1}, {'latitude': 1, 'longitude': 181}, {'latitude': float('nan'), 'longitude': 1}, {'latitude': True, 'longitude': 1}, {'latitude': '38.9', 'longitude': 1}, {}]:
            self.assertEqual(CityLookup(reader=Reader({'location': coords})).locate('1.1.1.1'), {'available': False})


if __name__ == '__main__':
    unittest.main()
