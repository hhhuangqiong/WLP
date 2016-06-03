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
import gfile from 'gulp-file';
import sourcemaps from 'gulp-sourcemaps';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import spriteSmith from 'gulp.spritesmith';
import merge from 'merge-stream';
import Q from 'q';
import { argv } from 'yargs';
import browserSync from 'browser-sync';
import * as fs from 'fs';
import * as path from 'path';
import { sync as globSync } from 'glob';
import onesky from 'onesky-utils';
import m800Locale from 'm800-user-locale';
import { ONE_SKY as oneSkyConfig } from './app/config/credentials';
import { LOCALES as supportedLangs } from './app/config';

const defaultTasks = ['nodemon', 'watch', 'scss', 'webpack'];
const webpackConfig = require('./webpack.config');

const DEFAULT_LANGUAGE_FILE_NAME = 'default.json';
const INTL_MESSAGES_PATTERN = './build/intl/**/*.json';

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
  intl: 'public/locale-data',
  babel: './build/babel',
};

gulp.task('test', (cb) => {
  require('babel-polyfill');

  gulp.src([`${dest.app}/**/*.js`])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => gulp.src(
      [
        'test/unit/**/*.js',
        'test/scss/**/*.js',
        'test/component/**/*.js',
      ]
    )
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

gulp.task('intl', () => {
  // a function that recursively combines files
  // that are generated by babel-plugin-react-intl
  // and transforms it into pure js object
  const namespacedMessages = globSync(INTL_MESSAGES_PATTERN)
    .map(filename => fs.readFileSync(filename, 'utf8'))
    .map(file => JSON.parse(file))
    .reduce((collection, descriptors) => {
      const newCollection = collection;

      descriptors.forEach(({ id, defaultMessage }) => {
        // skip current element and continue to combine the rest if the language key is duplicated
        if (collection.hasOwnProperty(id)) {
          return;
        }

        newCollection[id] = defaultMessage;
      });

      return newCollection;
    }, {});

  // write this file into pure key value json format into single file
  // in order to work with OneSky workflow easily
  const filename = path.join(dest.intl, DEFAULT_LANGUAGE_FILE_NAME);

  // Write default.json
  fs.writeFileSync(filename, JSON.stringify(namespacedMessages, null, 2));
});

gulp.task('webpack-dev-server', ['scss', 'webpack', 'intl'], (callback) => {
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

gulp.task('download-translation', () =>
  Promise.all(supportedLangs.map((lang) => {
    const locale = m800Locale.util.toOneSkyLocale(lang);

    gutil.log(`Downloading for language ${lang} by ${locale}...`);
    return onesky.getFile(Object.assign({
      language: locale,
    }, oneSkyConfig))
      .then((content) => {
        gutil.log(`Done download for ${lang}.`);

        gfile(`${lang}.json`, content, {
          src: true,
        })
        .pipe(gulp.dest(dest.intl));
      });
  }))
);

gulp.task('upload-translation', () => {
  const language = 'en';
  const defaultFile = path.join(dest.intl, DEFAULT_LANGUAGE_FILE_NAME);
  const downloadedLanguageFile = path.join(dest.intl, `${language}.json`);

  function readDefaultFile(originalData) {
    gutil.log('Reading the default.json');
    return Q.ninvoke(fs, 'readFile', defaultFile)
      .then((data) => Object.assign(JSON.parse(data), originalData));
  }

  function readDownloadedLanguageFile() {
    gutil.log(`Reading the ${language}.json`);
    return Q.ninvoke(fs, 'readFile', downloadedLanguageFile)
      .then((data) => JSON.parse(data))
      .catch((err) => {
        if (err.code === 'ENOENT') {
          return {};
        }
        throw err;
      });
  }

  function uploadFile(finalData) {
    gutil.log('Uploading the data', finalData);
    return onesky.postFile(Object.assign({
      content: JSON.stringify(finalData),
    }, {
      language, // upload content language
      keepStrings: true, // keep the uploaded strings not present
      format: 'HIERARCHICAL_JSON', // content format
    }, oneSkyConfig));
  }

  return readDownloadedLanguageFile().then(readDefaultFile).then(uploadFile);
});
