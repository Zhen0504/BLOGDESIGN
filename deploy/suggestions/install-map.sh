#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
test "$(id -u)" = 0 || { echo '请使用 sudo bash 执行'; exit 1; }
database=/home/ecs-user/zhen-geoip-20261010/geoip-city.mmdb
test -f "$database"
echo 'df17bd24390108ed1d24dcb7718dc60f6b9abd4f  /home/ecs-user/zhen-geoip-20261010/geoip-city.mmdb' | sha1sum -c -
apt-get update
DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a apt-get install -y python3-maxminddb
python3 -c 'import maxminddb, sys; r = maxminddb.open_database(sys.argv[1]); print(r.metadata().database_type); r.close()' "$database"
install -m 644 "$database" /opt/zhen-inbox/geoip-city.mmdb
bash deploy/suggestions/install.sh
