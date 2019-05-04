let gulp = require('gulp')

// Build

gulp.task('build:lib', () => {
  return gulp.src(['lib/*.js', 'lib/*.d.ts']).pipe(gulp.dest('build/lib'))
})

gulp.task('build:package', () => {
  let editor = require('gulp-json-editor')
  return gulp.src('./package.json')
    .pipe(editor(json => {
      delete json.scripts
      delete json.jest
      delete json.eslintConfig
      delete json['size-limit']
      delete json['pre-commit']
      delete json['lint-staged']
      delete json.yaspeller
      delete json.devDependencies
      return json
    }))
    .pipe(gulp.dest('build'))
})

gulp.task('build:docs', () => {
  let ignore = require('fs').readFileSync('.npmignore').toString()
    .trim().split(/\n+/)
    .concat([
      'package.json', '.npmignore', 'lib/*', 'test/*', 'CONTRIBUTING.md',
      'node_modules/**/*', 'docs/api.md', 'docs/plugins.md', '*-cn.md',
      'docs/writing-a-plugin.md', 'coverage', 'coverage/*', 'coverage/**/*'
    ]).map(i => '!' + i)
  return gulp.src(['**/*'].concat(ignore))
    .pipe(gulp.dest('build'))
})

gulp.task('build', gulp.parallel('build:lib', 'build:docs', 'build:package'))

// Tests

gulp.task('integration', gulp.series('build', done => {
  let postcss = require('./build')
  let real = require('postcss-parser-tests/real')
  real(done, css => {
    return postcss.parse(css).toResult({ map: { annotation: false } })
  })
}))

gulp.task('version', () => {
  let Processor = require('./lib/processor')
  let instance = new Processor()
  let pkg = require('./package')
  if (pkg.version !== instance.version) {
    throw new Error('Version in Processor is not equal to package.json')
  } else {
    return Promise.resolve()
  }
})

// Common

gulp.task('default', gulp.series('integration', 'version'))
