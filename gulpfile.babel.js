import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('default', ['clean'], () => {
  gulp.start('dist');
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('dist', ['html'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('html', ['stylesheets'], () => {
  return gulp.src('*.html')
    .pipe($.useref({searchPath: ['.tmp', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'stylesheets'}));
});

gulp.task('stylesheets', () => {
  return gulp.src('stylesheets/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10,
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.cssnano())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist/stylesheets'));
});

gulp.task('serve', ['stylesheets:tmp'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', '.'],
    }
  });

  gulp.watch([
    '*.html',
  ]).on('change', reload);

  gulp.watch('stylesheets/**/*.scss', ['stylesheets:tmp']);
});

gulp.task('stylesheets:tmp', () => {
  return gulp.src('stylesheets/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/stylesheets'))
    .pipe(reload({stream: true}));
});

