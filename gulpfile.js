var gulp   = require('gulp');
var gulpTaskLint = require('javascript-gulp-task-lint');
var execSync = require('child_process').execSync;

gulp.task('lint', function(cb) {
  var files = execSync("git ls-files -m '*.js'", {encoding: 'utf-8'}).trim().split("\n");
  gulpTaskLint(files)(cb);
});

gulp.task('pre-commit', ['lint']);

