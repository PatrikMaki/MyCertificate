#!/bin/bash
docker build -t mycertserver .
docker run -it -p 3000:3000 mycertserver