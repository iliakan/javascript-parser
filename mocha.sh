#!/bin/bash

# this script is used to run all or standalone mocha scripts
# like this:
#    ./mocha.sh
# OR
#    ./mocha.sh test/unit/model/user.js

# tried also gulp-mocha and node --harmony `which gulp` test,
# but it hangs after tests, not sure why, mocha.sh works fine so leave it as is
NODE_ENV=test NODE_PATH=. mocha --harmony $*

