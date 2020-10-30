# run "web-ext lint" and unit-tests (if available) on each project
test:
	cd signatureswitch-me; npm install; npm run lint; npm run test
	cd nestedquoteremover-me; npm install; npm run lint
