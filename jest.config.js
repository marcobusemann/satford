module.exports = {
   "roots": ["src"],
   "transform": {
       "^.+\\.tsx?$": "ts-jest"
   },
   "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
   "moduleFileExtensions": [
       "ts",
       "tsx",
       "js",
       "jsx",
       "json",
       "node"
   ],
   "globals": {
       "ts-jest": {
           "tsConfig": "src/tsconfig.json"
       }
   }
}