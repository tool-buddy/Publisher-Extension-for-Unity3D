const gulp = require('gulp')
const zip = require('gulp-zip')
const packageConfig = require('./package.json')

gulp.task('zip', function () {
  const fileName = `${process.env.VENDOR}-${packageConfig.version}.zip`

  return gulp.src(`dist/${process.env.VENDOR}/**/*`)
    .pipe(zip(fileName))
    .pipe(gulp.dest('dist'))
})
