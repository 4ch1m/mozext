#!/usr/bin/env python3

import sys
import json

composeDetails = json.loads(sys.argv[1])

with open("/tmp/data.json", "w") as outfile:
    json.dump(composeDetails, outfile)

print("done!")
