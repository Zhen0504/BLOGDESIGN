"""Local-only city lookup. Never calls a remote API or persists visitor IPs."""
import ipaddress
import math
from pathlib import Path


class CityLookup:
    def __init__(self, path=None, reader=None):
        self.reader = reader
        if path and Path(path).is_file():
            try:
                import maxminddb
                self.reader = maxminddb.open_database(path, mode=maxminddb.MODE_MMAP)
            except (ImportError, OSError, ValueError):
                self.reader = None

    def locate(self, address):
        unknown = {'available': False}
        if not self.reader:
            return unknown
        try:
            ip = ipaddress.ip_address(address)
            if not ip.is_global:
                return unknown
            record = self.reader.get(str(ip))
            if not isinstance(record, dict):
                return unknown
            coordinates = record.get('location', {})
            latitude, longitude = coordinates.get('latitude'), coordinates.get('longitude')
            if isinstance(latitude, bool) or isinstance(longitude, bool):
                return unknown
            if not isinstance(latitude, (int, float)) or not isinstance(longitude, (int, float)):
                return unknown
            if not math.isfinite(latitude) or not math.isfinite(longitude) or not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
                return unknown
            def name(section):
                names = record.get(section, {}).get('names', {})
                value = names.get('zh-CN') or names.get('en')
                return value[:80] if isinstance(value, str) else ''
            return {
                'available': True,
                'city': name('city'),
                'country': name('country'),
                'latitude': round(latitude, 1),
                'longitude': round(longitude, 1),
                'approximate': True,
                'source': 'DB-IP Lite',
            }
        except (ValueError, OSError, TypeError, AttributeError):
            return unknown

