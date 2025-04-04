#!/bin/bash

OWN_DIRECTORY=$(dirname -- "$(readlink -f "$0")")

NODE_NO_WARNINGS=1 node --experimental-strip-types $OWN_DIRECTORY/src/index.ts
