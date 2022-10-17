let fs = require("fs");
let path = require("path");
let Module = require("./module");
let MagicString = require("magic-string");

class Bundle {
	constructor(options) {
		//入口文件
		this.entryPath = path.resolve(options.entry.replace(/\.js$/, "")  + ".js");
		//存放所有的模块
		this.modules = {};
	}
	build(filename) {
		const entryModule = this.fetchModule(this.entryPath); //获取模块代码
		this.statements = entryModule.expandAllStatements(true); //展开所有的语句
		const { code } = this.generate(); //生成打包后的代码
		fs.writeFileSync(filename, code); //写入文件系统
	}
	fetchModule(importee, importer) {
		let route;
		if (!importer) {
			route = importee;
		} else {
			if (path.isAbsolute(importee)) {
				route = importee;
			} else {
				route = path.resolve(path.dirname(importer), importee.replace(/\.js$/, '')  + '.js');
			}
		}
		if (fs.existsSync(route)) {
			let code = fs.readFileSync(route, "utf8");  // 读取入口文件的模块内容
			const module = new Module({
				code,
				path: importee,
				bundle: this,
			});
			return module;
		}
	}
	generate() {
		let magicString = new MagicString.Bundle();
		this.statements.forEach((statement) => {
			const source = statement._source.clone();
			if(statement.type === "ExportNamedDeclaration") {
				source.remove(statement.start, statement.declaration.start);
			}

			magicString.addSource({
				content: source,
				separator: "\n",
			});
		});

		return { code: magicString.toString() };
	}
}

module.exports = Bundle;

