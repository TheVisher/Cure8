"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/module-details-from-path@1.0.4";
exports.ids = ["vendor-chunks/module-details-from-path@1.0.4"];
exports.modules = {

/***/ "(rsc)/./node_modules/.pnpm/module-details-from-path@1.0.4/node_modules/module-details-from-path/index.js":
/*!**********************************************************************************************************!*\
  !*** ./node_modules/.pnpm/module-details-from-path@1.0.4/node_modules/module-details-from-path/index.js ***!
  \**********************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar sep = (__webpack_require__(/*! path */ \"path\").sep)\n\nmodule.exports = function (file) {\n  var segments = file.split(sep)\n  var index = segments.lastIndexOf('node_modules')\n\n  if (index === -1) return\n  if (!segments[index + 1]) return\n\n  var scoped = segments[index + 1][0] === '@'\n  var name = scoped ? segments[index + 1] + '/' + segments[index + 2] : segments[index + 1]\n  var offset = scoped ? 3 : 2\n\n  var basedir = ''\n  var lastBaseDirSegmentIndex = index + offset - 1\n  for (var i = 0; i <= lastBaseDirSegmentIndex; i++) {\n    if (i === lastBaseDirSegmentIndex) {\n      basedir += segments[i]\n    } else {\n      basedir += segments[i] + sep\n    }\n  }\n\n  var path = ''\n  var lastSegmentIndex = segments.length - 1\n  for (var i2 = index + offset; i2 <= lastSegmentIndex; i2++) {\n    if (i2 === lastSegmentIndex) {\n      path += segments[i2]\n    } else {\n      path += segments[i2] + sep\n    }\n  }\n\n  return {\n    name: name,\n    basedir: basedir,\n    path: path\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbW9kdWxlLWRldGFpbHMtZnJvbS1wYXRoQDEuMC40L25vZGVfbW9kdWxlcy9tb2R1bGUtZGV0YWlscy1mcm9tLXBhdGgvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQVk7O0FBRVosVUFBVSw2Q0FBbUI7O0FBRTdCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0JBQWtCLDhCQUE4QjtBQUNoRDtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0NBQWdDLHdCQUF3QjtBQUN4RDtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcVmlzaExhcFxcQ3VyZThcXG5vZGVfbW9kdWxlc1xcLnBucG1cXG1vZHVsZS1kZXRhaWxzLWZyb20tcGF0aEAxLjAuNFxcbm9kZV9tb2R1bGVzXFxtb2R1bGUtZGV0YWlscy1mcm9tLXBhdGhcXGluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xuXG52YXIgc2VwID0gcmVxdWlyZSgncGF0aCcpLnNlcFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gIHZhciBzZWdtZW50cyA9IGZpbGUuc3BsaXQoc2VwKVxuICB2YXIgaW5kZXggPSBzZWdtZW50cy5sYXN0SW5kZXhPZignbm9kZV9tb2R1bGVzJylcblxuICBpZiAoaW5kZXggPT09IC0xKSByZXR1cm5cbiAgaWYgKCFzZWdtZW50c1tpbmRleCArIDFdKSByZXR1cm5cblxuICB2YXIgc2NvcGVkID0gc2VnbWVudHNbaW5kZXggKyAxXVswXSA9PT0gJ0AnXG4gIHZhciBuYW1lID0gc2NvcGVkID8gc2VnbWVudHNbaW5kZXggKyAxXSArICcvJyArIHNlZ21lbnRzW2luZGV4ICsgMl0gOiBzZWdtZW50c1tpbmRleCArIDFdXG4gIHZhciBvZmZzZXQgPSBzY29wZWQgPyAzIDogMlxuXG4gIHZhciBiYXNlZGlyID0gJydcbiAgdmFyIGxhc3RCYXNlRGlyU2VnbWVudEluZGV4ID0gaW5kZXggKyBvZmZzZXQgLSAxXG4gIGZvciAodmFyIGkgPSAwOyBpIDw9IGxhc3RCYXNlRGlyU2VnbWVudEluZGV4OyBpKyspIHtcbiAgICBpZiAoaSA9PT0gbGFzdEJhc2VEaXJTZWdtZW50SW5kZXgpIHtcbiAgICAgIGJhc2VkaXIgKz0gc2VnbWVudHNbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgYmFzZWRpciArPSBzZWdtZW50c1tpXSArIHNlcFxuICAgIH1cbiAgfVxuXG4gIHZhciBwYXRoID0gJydcbiAgdmFyIGxhc3RTZWdtZW50SW5kZXggPSBzZWdtZW50cy5sZW5ndGggLSAxXG4gIGZvciAodmFyIGkyID0gaW5kZXggKyBvZmZzZXQ7IGkyIDw9IGxhc3RTZWdtZW50SW5kZXg7IGkyKyspIHtcbiAgICBpZiAoaTIgPT09IGxhc3RTZWdtZW50SW5kZXgpIHtcbiAgICAgIHBhdGggKz0gc2VnbWVudHNbaTJdXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhdGggKz0gc2VnbWVudHNbaTJdICsgc2VwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIGJhc2VkaXI6IGJhc2VkaXIsXG4gICAgcGF0aDogcGF0aFxuICB9XG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/module-details-from-path@1.0.4/node_modules/module-details-from-path/index.js\n");

/***/ })

};
;