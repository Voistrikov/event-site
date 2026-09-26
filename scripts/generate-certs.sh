#!/usr/bin/env bash
set -euo pipefail
CERT_DIR="$(cd "$(dirname "$0")/.." && pwd)/certs"
mkdir -p "$CERT_DIR"

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$CERT_DIR/server.key" \
  -out    "$CERT_DIR/server.crt" \
  -days 365 \
  -subj "/C=GR/ST=Attica/L=Athens/O=TEDI/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:backend,IP:127.0.0.1"

chmod 600 "$CERT_DIR/server.key"
echo "✓ Wrote $CERT_DIR/server.key and server.crt (valid 365 days)"
