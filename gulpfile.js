const gulp   = require('gulp');
const gulpTaskLint = require('javascript-gulp-task-lint');
const execSync = require('child_process').execSync;

gulp.task('lint', function(cb) {
  const files = execSync("git ls-files -m '*.js'", {encoding: 'utf-8'}).trim().split("\n");
  gulpTaskLint(files)(cb);
});

gulp.task('pre-commit', ['lint']);

