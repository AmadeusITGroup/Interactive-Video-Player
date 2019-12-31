deploy-stable:
	rm -fr build
	npm run build
	gsutil -m cp -r -Z build/* gs://travelcast/stable
	gsutil -m acl ch -r -u AllUsers:R gs://travelcast/stable
	gsutil -m setmeta -r -h 'Cache-Control:public, max-age=31536000, no-transform' gs://travelcast/stable
	gsutil -m setmeta -r -h 'Cache-Control:no-cache, no-store, must-revalidate' gs://travelcast/stable/loader.js
	gsutil -m setmeta -r -h 'Cache-Control:no-cache, no-store, must-revalidate' gs://travelcast/stable/manifest.json
	typedoc ./src/index.js
	firebase deploy

deploy-edge:
	rm -fr build
	npm run build
	gsutil -m cp -r -Z build/* gs://travelcast/edge
	gsutil -m acl ch -r -u AllUsers:R gs://travelcast/edge
	gsutil -m setmeta -r -h 'Cache-Control:public, max-age=31536000, no-transform' gs://travelcast/edge
	gsutil -m setmeta -r -h 'Cache-Control:no-cache, no-store, must-revalidate' gs://travelcast/edge/loader.js
	gsutil -m setmeta -r -h 'Cache-Control:no-cache, no-store, must-revalidate' gs://travelcast/edge/manifest.json

develop-library:
	fswatch -o src | xargs -n1 /bin/bash -c 'mode=development npm run library; echo "Copying generated dist folder to ../amadeus-video-solutions/frontend/node_modules/amadeus-video-player"; cp -rf dist ../amadeus-video-solutions/frontend/node_modules/amadeus-video-player'