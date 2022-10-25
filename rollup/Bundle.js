import { basename, dirname, extname, resolve } from "path";
import fs from 'fs';
import { defaultResolver } from "./utils/resolvePath";
import { keys, has } from "./utils/object";
import { hasOwnProperty } from "../lib/utils";
import { fstat } from "fs";
import Module from "./Module";



export default class Bundle {
    constructor(options) {
        this.entryPath = resolve(options.entry).replace(/\.js$/, "") + ".js";
        this.base = dirname(this.entryPath);

        this.resolvePath = options.resolvePath || defaultResolver;

        this.entryModule = null;
        this.modulePromises = {};
        this.statements = [];
        this.externalModules = [];
        this.defaultExportName = null;
        this.internalNamespaceModules = [];
    }

    fetchModule(importee, importer) {
        return Promise.resolve(importer === null ? importee : this.resolvePath(importee, importer)).then(path => {
            // 边界条件先忽略
            if (!path) {

            }

            if (!hasOwnProperty(this.modulePromises, path)) {
                const code = fs.readFileSync(path, {
                    encoding: 'utf8',
                })
                const module = new Module({
                    path, code, bundle: this
                })
                this.modulePromises[path] = module
            }

            return this.modulePromises[path]

        })
    }

    build() {
        return this.fetchModule(this.entryPath, null)
            .then(( entryModule ) => {
                this.entryModule = entryModule;

                if (entryModule.exports.default) {
                  let defaultExportName = makeLegalIdentifier(
                    basename(this.entryPath).slice(0, -extname(this.entryPath).length)
                  );
                  while (entryModule.ast._scope.contains(defaultExportName)) {
                    defaultExportName = `_${defaultExportName}`;
                  }
        
                  entryModule.suggestName("default", defaultExportName);
                }
        
                return entryModule.expandAllStatements(true);
            }).then((statements) => {
                this.statements = statements;
                this.deconflict();
            });
    }

    deconflict() {

    }

}