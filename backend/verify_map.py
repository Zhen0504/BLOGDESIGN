"""One-off local database verification; prints no raw visitor address."""
import json
import sys
from geolocation import CityLookup

lookup = CityLookup(sys.argv[1])
result = lookup.locate(sys.argv[2])
print(json.dumps(result, ensure_ascii=False))
if not result['available']:
    raise SystemExit('No usable city coordinates returned')
