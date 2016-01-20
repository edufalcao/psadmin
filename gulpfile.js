"use strict";

var gulp = require("gulp");
var connect = require("gulp-connect"); // runs a local dev server
var open = require("gulp-open"); // open a URL in a web browser
var browserify = require("browserify"); // bundles JS
var reactify = require("reactify"); // transforms React JSX to JS
var source = require("vinyl-source-stream"); // use conventional text streams with Gulp
var concat = require("gulp-concat"); // concatenates files
var lint = require("gulp-eslint"); // lint JS files, including JSX


var config = {
  port: 9005,
  devBaseUrl: "http://localhost",
  paths: {
    html: "./src/*.html",
    js: "./src/**/*.js",
    images: "./src/images/*",
    css: [
      "node_modules/bootstrap/dist/css/bootstrap.min.css",
      "node_modules/bootstrap/dist/css/bootstrap-theme.min.css"
    ],
    mainJs: "./src/main.js",
    dist: "./dist"
  }
};

// start a local development server
gulp.task("connect", function() {
  connect.server({
    root: ["dist"],
    port: config.port,
    base: config.devBaseUrl,
    livereload: true
  });
});

// open the browse in the specified url
gulp.task("open", ["connect"], function() {
  gulp.src("dist/index.html")
      .pipe(open({ uri: config.devBaseUrl + ":"  + config.port + "/" }));
});

// copy html files to the destination folder
gulp.task("html", function() {
  gulp.src(config.paths.html)
      .pipe(gulp.dest(config.paths.dist))
      .pipe(connect.reload());
});

// manipulate js files, bundling them and copying to the destination folder
gulp.task("js", function() {
  browserify(config.paths.mainJs)
    .transform(reactify)
    .bundle()
    .on("error", console.error.bind(console))
    .pipe(source("bundle.js"))
    .pipe(gulp.dest(config.paths.dist + "/scripts"))
    .pipe(connect.reload());
});

// bundle css files and move to to destination folder
gulp.task("css", function() {
  gulp.src(config.paths.css)
      .pipe(concat("bundle.css"))
      .pipe(gulp.dest(config.paths.dist + "/css"))
      .pipe(connect.reload());
});

// migrate images to dist folder
gulp.task("images", function() {
  gulp.src(config.paths.images)
      .pipe(gulp.dest(config.paths.dist + "/images"))
      .pipe(connect.reload());
  
  // publish favicon
  gulp.src("./src/favicon.ico")
      .pipe(gulp.dest(config.paths.dist))
});

gulp.task("lint", function() {
  return gulp.src(config.paths.js)
              .pipe(lint({config: "eslint.config.json"}))
              .pipe(lint.format());
});

// watch for file changes
gulp.task("watch", function() {
  gulp.watch(config.paths.html, ["html"]);
  gulp.watch(config.paths.js, ["js", "lint"]);
  gulp.watch(config.paths.css, ["css"]);
})

gulp.task("default", ["html", "js", "css", "images", "lint", "open", "watch"]);