var gulp   = require('gulp');
var gulpTaskLint = require('javascript-gulp-task-lint');

gulp.task('lint', gulpTaskLint(['**/*.js', '!node_modules/**']));

gulp.task('pre-commit', ['lint']);
