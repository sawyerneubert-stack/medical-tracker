#!/bin/bash
# Run the medical tracker — fetches latest data and opens the HTML
cd "$(dirname "$0")"
python3 fetch.py
