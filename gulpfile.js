"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var editorconfig = require("gulp-lintspaces");
var stylelint = require("gulp-stylelint");
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var htmlmin = require("gulp-htmlmin");
var del = require("del");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgoPrecision = {
  floatPrecision: 2
};
var svgoSettings = {
  plugins: [
    { removeViewBox: false },
    { removeTitle: true },
    { cleanupNumericValues: svgoPrecision },
    { cleanupNumericValues: svgoPrecision },
    { convertPathData: svgoPrecision },
    { transformsWithOnePath: svgoPrecision },
    { convertTransform: svgoPrecision },
    { cleanupListOfValues: svgoPrecision }
  ]
};
var svgstore = require("gulp-svgstore");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");

gulp.task("html", function () {
  return gulp.src("source/**/*.html")
    .pipe(plumber())
    .pipe(editorconfig({
      editorconfig: ".editorconfig"
    }))
    .pipe(editorconfig.reporter())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
});

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"));
});

gulp.task("css:lint", function () {
  return gulp.src("source/sass/**/*.scss")
    .pipe(plumber())
    .pipe(editorconfig({
      editorconfig: ".editorconfig"
    }))
    .pipe(editorconfig.reporter())
    .pipe(stylelint({
      reporters: [{
        console: true,
        formatter: "string"
      }]
    }));
});

gulp.task("fonts", function () {
  return gulp.src("source/fonts/**/*.{woff,woff2}")
    .pipe(gulp.dest("build/fonts"));
});

gulp.task("images", function () {
    return gulp.src("source/img/*.{png,jpg,svg}")
      .pipe(imagemin([
        imagemin.optipng({
          optimizationLevel: 3
        }),
        imagemin.jpegtran({
          progressive: true
        }),
        imagemin.svgo(svgoSettings)
      ]))
      .pipe(gulp.dest("build/img"))
      .pipe(webp({
        quality: 90
      }))
      .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function () {
  return gulp.src("source/img/symbols/*.svg")
    .pipe(imagemin([
      imagemin.svgo(svgoSettings)
    ]))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("script", function () {
  return gulp.src([
      "node_modules/picturefill/dist/picturefill.min.js",
      "node_modules/svg4everybody/dist/svg4everybody.min.js",
      "source/js/script.js"
    ])
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(concat("script.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(uglify())
    .pipe(rename("script.min.js"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/js"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("script:lint", function () {
  return gulp.src("source/js/**/*.js")
    .pipe(plumber())
    .pipe(editorconfig({
      editorconfig: ".editorconfig"
    }))
    .pipe(editorconfig.reporter());
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css:lint", "css", "refresh"));
  gulp.watch("source/js/**/*.js", gulp.series("script:lint", "script", "refresh"));
 gulp.watch("source/img/symbols/*.svg", gulp.series("sprite", "refresh"));
 gulp.watch("source/img/*.{jpg,png,svg}", gulp.series("images", "refresh"));
 gulp.watch("source/*.html", gulp.series("html", "refresh"));
});

 gulp.task("build", gulp.series("clean", gulp.parallel(
   "html",
   "css",
   "script",
   "images",
   "sprite",
   "fonts"
 )));

 gulp.task("start", gulp.series("build", "server"));
