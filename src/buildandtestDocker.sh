#!/bin/bash
docker build -t mycertserver .
docker run -it mycertserver npm test