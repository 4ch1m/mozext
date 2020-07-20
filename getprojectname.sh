#!/bin/sh
xmlstarlet sel -t  -m "//em:name" -v . install.rdf | tr -d " " | tr "[:upper:]" "[:lower:]"
