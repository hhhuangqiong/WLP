import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import del from 'del';
import gulp from 'gulp';
import gutil from 'gulp-util';
import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';
import nodemon from 'gulp-nodemon';
import sass from 'gulp-sass';
import bless from 'gulp-bless';
import sourcemaps from 'gulp-sourcemaps';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import spriteSmith from 'gulp.spritesmith';
import merge from 'merge-stream';
import { argv } from 'yargs';
import browserSync from 'browser-sync';


const defaultTasks = ['nodemon', 'watch', 'scss', 'webpack', 'browser-sync'];
const webpackConfig = require('./webpack.config');

if (webpackConfig.custom.hotLoadPort) {
  defaultTasks.push('webpack-dev-server');
}

const src = {
  allJS: 'app/**/*.js',
  scss: 'public/scss/main.scss',
};

const dest = {
  build: './build',
  app: './node_modules/app',
  css: 'public/stylesheets',
  image: 'public/images',
};

gulp.task('test', (cb) => {
  gulp.src([`${dest.app}/**/*.js`])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => gulp.src(
      ['test/unit/**/*.coffee', 'test/unit/**/*.js', 'test/scss/**/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports({
          dir: `${dest.build}/coverage`,
        }))
        .on('end', cb)
    );
});

gulp.task('default', defaultTasks, () => {
  gutil.log('[default] done \uD83D\uDE80');
});

gulp.task('sprite', () => {
  const spriteData = gulp.src(`${dest.image}/flag_256/*png`)
    .pipe(spriteSmith({
      imgName: '../images/map-sprite.png',
      cssName: 'map-sprite.css',
      padding: 5,
      cssOpts: {
        functions: false,
        cssSelector(item) {
          return `.flag--${item.name}`;
        },
      },
    }));
  const imgStream = spriteData.img.pipe(gulp.dest(dest.image));
  const cssStream = spriteData.css.pipe(gulp.dest(dest.css));
  return merge(imgStream, cssStream);
});

gulp.task('watch', () => {
  gulp.watch('public/scss/**/*.scss', ['scss']);
});

gulp.task('clean', () => del([`${dest.app}`, `${dest.build}/**/*`]));

const autoprefixerOpts = {
  browsers: ['last 2 versions'],
};

gulp.task('scss:production', () =>
  gulp.src(src.scss)
    .pipe(sass({
      outputStyle: 'compressed',
    }))
    .pipe(autoprefixer(autoprefixerOpts))
    .pipe(bless())
    .pipe(gulp.dest(dest.css))
);

gulp.task('scss', () =>
  gulp.src(src.scss).pipe(sourcemaps.init()).pipe(sass({
    onError(e) {
      return gutil.log(e);
    },
  }))
  .pipe(autoprefixer(autoprefixerOpts))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(dest.css))
  .pipe(((browserSync !== null) && browserSync.active ? browserSync.reload({
    stream: true,
  }) : gutil.noop()))
);

function _continueOnError(fn) {
  const _fn = fn();
  _fn.on('error', (e) => {
    gutil.log(e);
    _fn.end();
  });
  return _fn;
}

gulp.task('babel', () => {
  const b = /^watch/.test(argv._[0]) ? _continueOnError(babel) : babel();
  return gulp.src(src.allJS)
    .pipe(b)
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest.app));
});

gulp.task('webpack', (cb) => {
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    if (argv.debug) {
      gutil.log('[webpack]', stats.toString({
        timings: true,
        colors: true,
      }));
    } else {
      gutil.log('[webpack] Finished \ud83d\udc4d');
    }
    return cb();
  });
  return;
});

gulp.task('webpack-dev-server', ['scss', 'webpack'], (callback) => {
  const hotLoadPort = webpackConfig.custom.hotLoadPort;
  const devServer = new WebpackDevServer(webpack(webpackConfig), {
    contentBase: webpackConfig.output.path,
    hot: true,
    noInfo: true,
    watchOptions: {
      aggregateTimeout: 100,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
  devServer.listen(hotLoadPort, '0.0.0.0', (err) => {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }
    gutil.log(`[webpack-dev-server] ${webpackConfig.output.publicPath}`);
    return callback();
  });
});

gulp.task('nodemon', () =>
  nodemon({
    script: 'bin/www',
    nodeArgs: [argv.debug ? '--debug' : ''],
  }).on('restart', () => {
    gutil.log('nodemon restarted! \uD83D\uDE80');
  })
);

gulp.task('browser-sync', () => {
  browserSync({
    proxy: 'localhost:3000',
    startPath: '/',
    port: 3333,
  });
});
