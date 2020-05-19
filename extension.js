var hx = require("hbuilderx");

// 该方法将在插件激活的时候调用

const AlignSymbols = [{
		name: 'Comma',
		command: 'extension.alignComma',
		symbol: ','
	},
	{
		name: 'Colon',
		command: 'extension.alignColon',
		symbol: ':'
	},
	{
		name: 'Equal',
		command: 'extension.alignEqual',
		symbol: '='
	},
	{
		name: 'Sharp',
		command: 'extension.alignSharp',
		symbol: '#'
	},
]

function activate(context) {

	// trim empty lines
	let trimEmptyLines = hx.commands.registerCommand('extension.trimEmptyLines', () => {
		let activeEditor = hx.window.getActiveTextEditor();
		activeEditor.then(editor => {
			let selection = editor.selection;
			let document = editor.document;
			let word = document.getText(selection);
			let trimed = word.replace(/(?<=\n)\s*?\n/g, '');
			editor.edit(editBuilder => {
				editBuilder.replace(selection, trimed);
			});
		})
	});
	context.subscriptions.push(trimEmptyLines);

	// alygn symbols
	AlignSymbols.forEach(item => {
		// 添加到注销数组中
		context.subscriptions.push(
			hx.commands.registerCommand(item.command, () => {
				let activeEditor = hx.window.getActiveTextEditor();
				activeEditor.then(editor => {
					let selection = editor.selection;
					let document = editor.document;
					let word = document.getText(selection);
					// if is comma, algn symbol
					let alignSymbol = item.symbol !== ',';
					let output = getAlignedStringWith(item.symbol, word, alignSymbol);
					editor.edit(editBuilder => {
						editBuilder.replace(selection, output);
					});
				})
			})
		);
	})

}
// 该方法将在插件禁用的时候调用（目前是在插件卸载的时候触发）
function deactivate() {

}

/**
 * Align String With Symbol
 * @date 2020-05-19 16:17:10
 * @author KyleBing(kylebing@163.com)
 * @website https://kylebing.cn
 * @param {String} symbol: 标点
 * @param {String} word: 选中的内容
 * @param {Boolean} alignSymbol: 对齐标点还是内容
 * @return String
 */

function getAlignedStringWith(symbol, word, alignSymbol) {
	// === LOGIC Start ===
	let selectArray = word.split('\n');
	let mainArray = [];
	let maxLengthArray = []; // 记录每列最长宽度
	selectArray.forEach(item => {
		// apart line
		let segments = item.split(symbol);

		let segmentArray = [];
		segments.forEach((segment, index) => {
			segment = segment.trim();
			// get max string length of each segment
			if (segment.length > (maxLengthArray[index] || 0)) {
				maxLengthArray[index] = segment.length
			}
			segmentArray.push(segment);
		})
		// push item to main array
		mainArray.push(segmentArray);
	});

	// manipulate
	let output = '';
	mainArray.forEach(item => {
		let tempLine = ''
;		item.forEach((segment, index) => {
			if (alignSymbol) {
				tempLine +=`${segment.padEnd(maxLengthArray[index]+1, ' ')}${index+1 === item.length? '': symbol} `; // if last one, no symbol
			} else {
				tempLine += `${segment}${index+1 === item.length? '': symbol}`.padEnd(maxLengthArray[index] + 2, ' ')
			}
		})
		let lineStr = `${tempLine}\n`;
		output += lineStr
	})
	return output;
}


module.exports = {
	activate,
	deactivate
}
