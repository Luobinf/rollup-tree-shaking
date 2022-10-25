import { relative } from 'path';
import MagicString from 'magic-string';
import { parse } from 'acorn';
import getLocation from './utils/getLocation';
import analyse from './ast/analyse';
import makeLegalIdentifier from './utils/makeLegalIdentifier';

export default class Module {
    constructor({
        path, code, bundle
    }) {
        this.bundle = bundle;
        this.path = path;
        this.relativePath = relative(bundle.base, path).slice(0, -3); // remove .js

        this.code = new MagicString(code, {
            filename: path
        });

        this.suggestedNames = {};
        this.comments = [];

        try {
            this.ast = parse(code, {
                ecmaVersion: 2022,
                sourceType: 'module',
                onComment: (block, text, start, end) => this.comments.push({ block, text, start, end })
            });
        } catch (err) {
            err.file = path;
            throw err;
        }

        this.analyse();
    }

    analyse() {
        // imports and exports, indexed by ID
        this.imports = {};
        this.exports = {};

        // 找出导入导出的变量合集存入 module 的 imports、exports 属性中去
        this.ast.body.forEach((node => {
            let source;

            // import foo from './foo';
            // import { bar } from './bar';
            if (node.type === 'ImportDeclaration') {
                source = node.source.value;

                node.specifiers.forEach(specifier => {
                    const isDefault = specifier.type === 'ImportDefaultSpecifier';
                    const isNamespace = specifier.type === 'ImportNamespaceSpecifier';

                    const localName = specifier.local.name;
                    const name = isDefault ? 'default' : isNamespace ? '*' : specifier.imported.name;

                    if (has(this.imports, localName)) {
                        const err = new Error(`Duplicated import '${localName}'`);
                        err.file = this.path;
                        err.loc = getLocation(this.code.original, specifier.start);
                        throw err;
                    }

                    this.imports[localName] = {
                        source,
                        name,
                        localName
                    };
                });
            }
            else if (/^Export/.test(node.type)) {
                // export default function foo () {}
                // export default foo;
                // export default 42;
                if (node.type === 'ExportDefaultDeclaration') {
                    const isDeclaration = /Declaration$/.test(node.declaration.type);

                    this.exports.default = {
                        node,
                        name: 'default',
                        localName: isDeclaration ? node.declaration.id.name : 'default',
                        isDeclaration
                    };
                }

                // export { foo, bar, baz }
                // export var foo = 42;
                // export function foo () {}
                else if (node.type === 'ExportNamedDeclaration') {
                    // export { foo } from './foo';
                    source = node.source && node.source.value;

                    if (node.specifiers.length) {
                        // export { foo, bar, baz }
                        node.specifiers.forEach(specifier => {
                            const localName = specifier.local.name;
                            const exportedName = specifier.exported.name;

                            this.exports[exportedName] = {
                                localName,
                                exportedName
                            };

                            if (source) {
                                this.imports[localName] = {
                                    source,
                                    localName,
                                    name: exportedName
                                };
                            }
                        });
                    } else {
                        let declaration = node.declaration;

                        let name;

                        if (declaration.type === 'VariableDeclaration') {
                            // export var foo = 42
                            name = declaration.declarations[0].id.name;
                        } else {
                            // export function foo () {}
                            name = declaration.id.name;
                        }

                        this.exports[name] = {
                            node,
                            localName: name,
                            expression: declaration
                        };
                    }
                }

            }


            analyse( this.ast, this.code, this );

        }))

    }

    expandAllStatements() {

    }

    
    suggestName ( exportName, suggestion ) {
		if ( !this.suggestedNames[ exportName ] ) {
			this.suggestedNames[ exportName ] = makeLegalIdentifier( suggestion );
		}
	}

}

