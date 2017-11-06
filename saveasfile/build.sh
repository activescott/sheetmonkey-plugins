#!/bin/bash

die () {
	printf >&2 "$@"
	exit 1
}

cp ./node_modules/file-saver/FileSaver.min.js ./
./node_modules/.bin/rollup --config
result=$?
echo "rollup result: $result"
if [[ result -ne 0 ]]; then 
	die '\nrollup build failed!\n\n'
fi

