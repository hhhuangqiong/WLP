import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import del from 'del';
import gulp from 'gulp';
import gutil from 'gulp-util';
import nodemon from 'gulp-nodemon';
import sass from 'gulp-sass';
import bless from 'gulp-bless';
import sourcemaps from 'gulp-sourcemaps';
import Cache from 'gulp-file-cache';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import spriteSmith from 'gulp.spritesmith';
import merge from 'merge-stream';
import { argv } from 'yargs';
import browserSync from 'browser-sync';
import zip from 'gulp-zip';
import injectM800LocaleGulpTasks from 'm800-user-locale/gulpTasks';
import { ONE_SKY as oneSkyConfig } from './app/config/credentials';
import { LOCALES as supportedLangs } from './app/config';

const gulpSequence = require('gulp-sequence').use(gulp);
const defaultTasks = ['copy', ['nodemon', 'watch', 'scss', 'webpack']];
const webpackConfig = require('./webpack.config');

const INTL_MESSAGES_PATTERN = './build/intl/**/*.json';

if (webpackConfig.custom.hotLoadPort) {
  defaultTasks.push('webpack-dev-server');
}

const babelCache = new Cache();

const src = {
  allJs: 'app/**/*.js',
  all: 'app/**/*.json',
  scss: 'public/scss/main.scss',
};

const dest = {
  build: './build',
  app: './dist',
  css: 'public/stylesheets',
  image: 'public/images',
  intl: 'public/locale-data',
  babel: './build/babel',
};

function _continueOnError(fn) {
  const _fn = fn();
  _fn.on('error', (e) => {
    gutil.log(e);
    _fn.end();
  });
  return _fn;
}

gulp.task('default', gulpSequence(...defaultTasks));

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

gulp.task('clean', () => del([dest.app, `${dest.build}/**/*`, dest.intl, dest.babel]));

const autoprefixerOpts = {
  browsers: ['last 3 versions'],
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
  gulp.src(src.scss)
    .pipe(sourcemaps.init())
    .pipe(sass({
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

gulp.task('copy', () =>
  gulp.src(src.all)
    .pipe(gulp.dest(dest.app))
);

gulp.task('babel', () => {
  const b = /^watch/.test(argv._[0]) ? _continueOnError(babel) : babel();
  return gulp.src(src.allJs)
    .pipe(babelCache.filter())
    .pipe(b)
    .pipe(babelCache.cache())
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

gulp.task('nodemon', ['babel'], () =>
  nodemon({
    script: 'bin/www',
    watch: 'app/',
    tasks: ['babel'],
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

injectM800LocaleGulpTasks(gulp, {
  messages: [INTL_MESSAGES_PATTERN],
  source: dest.intl,
  languages: supportedLangs,
  oneSky: oneSkyConfig,
});

const migrateFolder = 'migrate';
const buildMigrateFolder = `${dest.build}/migrate`;
gulp.task('migrate:copy', () =>
   gulp.src([`${migrateFolder}/**`, `!${migrateFolder}/src/**`])
     .pipe(gulp.dest(buildMigrateFolder))
);

gulp.task('migrate:babel', () =>
  gulp.src(`${migrateFolder}/src/**/*.js`)
    .pipe(babel())
    .pipe(gulp.dest(`${buildMigrateFolder}/src`))
);

gulp.task('migrate:package', () =>
  gulp.src(`${buildMigrateFolder}/**`)
    .pipe(zip('migrateScript.zip'))
    .pipe(gulp.dest(dest.build))
);

// before migrate build, it will perform npm i
// copy the whole folder to dist
// babel the src folder
// zip
gulp.task('migrate:build', ['migrate:copy', 'migrate:babel', 'migrate:package']);
