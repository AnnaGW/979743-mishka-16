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
var combineMq = require("gulp-combine-mq");
var csso = require("gulp-csso");
var rename = require("gulp-rename");

gulp.task("html", function () {
  return gulp.src("source/**/*.html")
    .pipe(plumber())
    .pipe(editorconfig({
      editorconfig: ".editorconfig"
    }))
    .pipe(editorconfig.reporter())
    .pipe(server.stream());
});

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(combineMq())
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

gulp.task("server", function () {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css:lint", "css"));
  gulp.watch("source/*.html", gulp.series("html"));
});

gulp.task("start", gulp.series("html", "css", "css:lint", "server"));
