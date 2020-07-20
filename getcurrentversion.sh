#!/bin/sh
xmlstarlet sel -t  -m "//em:version" -v . install.rdf | tr "." "_"
