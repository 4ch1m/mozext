#!/bin/sh
xmlstarlet sel -t -v "//em:name" install.rdf | head -n1 | tr -d " " | tr "[:upper:]" "[:lower:]"
