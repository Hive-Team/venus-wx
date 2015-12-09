var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var webserver = require('gulp-webserver');
var buffer = require('vinyl-buffer');
var uglify= require('gulp-uglify');
var del = require('del');

gulp.task('browserify', function() {
  browserify('./app/src/app.js', { debug: true })
      .transform(babelify)
      .bundle()
      .on("error", function (err) { console.log("Error : " + err.message); })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      //.pipe(uglify())
      .pipe(gulp.dest('./app/build'))
});

gulp.task('watch', function() {
  gulp.watch('./app/src/**/*.js', ['cleanjs','browserify'])
});
gulp.task('uglify',function(){
    return gulp.src('./app/build/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./app/build'));
})

gulp.task("cleanjs",function(cb){
  del(['./app/build/*.js'], cb);
});

gulp.task('webserver', function() {
  gulp.src('./app')
    .pipe(webserver({
      host: '0.0.0.0',
	  port:8888,
      livereload: false
    })
  );
});

gulp.task('default', ['browserify', 'watch', 'webserver']);
