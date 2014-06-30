var gulp   = require('gulp');
var gutil = require('gulp-util');
var map = require('map-stream');
var jshint = require('gulp-jshint');
var fs = require('fs');
var path = require('path');

var exitCode = 0;

gulp.task('lint', function() {
  var totalLintErrors = null;

  var options = JSON.parse(fs.readFileSync(path.join(__dirname, '.jshintrc')));

  return gulp.src('**/*.js')
    .pipe(jshint(options))
    .pipe(jshint.reporter('default'))
    .pipe(map(function (file, cb) {
      if (!file.jshint.success) {
        totalLintErrors += file.jshint.results.length;
        exitCode = 1;
      }
      cb(null, file);
    }))
    .on('end', function () {
      var errString = totalLintErrors + '';
      if (exitCode) {
        console.log(gutil.colors.magenta(errString), 'errors\n');
        gutil.beep();
      }
      if (exitCode) {
        process.emit('exit');
      }
    });
});

gulp.task('pre-commit', ['lint']);

process.on('exit', function () {
  process.nextTick(function () {
    var msg = "gulp '" + gulp.seq + "' failed";
    console.log(gutil.colors.red(msg));
    process.exit(exitCode);
  });
});
