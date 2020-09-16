# run "web-ext lint" on each project (for TravisCI)
test:
	cd signatureswitch-me; npm install; npm run lint
	cd nestedquoteremover-me; npm install; npm run lint
