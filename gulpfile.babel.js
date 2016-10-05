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

gulp.task('html', ['stylesheets', 'scripts'], () => {
  return gulp.src('*.html')
    .pipe($.useref({searchPath: ['.tmp', '.']}))
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'))
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
    .pipe(gulp.dest('dist/stylesheets'))
    .pipe($.size({title: 'stylesheets'}));
});

gulp.task('scripts', () => {
  return gulp.src('scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.babel())
    .pipe($.uglify({
      sourceRoot: '.',
      sourceMapIncludeSources: true
    }))
    .pipe($.concat('material-design-components.js'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe($.size({title: 'scripts'}));
});

gulp.task('serve', ['stylesheets:tmp', 'scripts:tmp'], () => {
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
  gulp.watch('scripts/**/*.js', ['scripts:tmp']);
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

gulp.task('scripts:tmp', () => {
  return gulp.src('scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

