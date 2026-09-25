#!/bin/bash

# ONE-LINE DEPLOY COMMAND FOR HOSTINGER
# Copy and paste this into SSH terminal

cd /home/u122886170/domains/compressify.gujjugarba.com && git pull origin main && LATEST=$(ls -t hbuilds/versions/ 2>/dev/null | head -1) && if [ -n "$LATEST" ]; then cd hbuilds/versions/$LATEST/nodejs/server; fi && /opt/alt/alt-nodejs24/root/usr/bin/npm install --production --ignore-scripts && /opt/alt/alt-nodejs24/root/usr/bin/npm run build && echo "✅ Deployment completed!"
