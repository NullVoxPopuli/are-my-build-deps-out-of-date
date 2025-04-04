#!/bin/bash

src="$(dirname "${BASH_SOURCE[0]}")/src"

NODE_NO_WARNINGS=1 node --experimental-strip-types $src/index.ts
