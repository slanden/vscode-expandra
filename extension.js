const vscode = require("vscode");

/** Configures Expandra for a specific language
 * @typedef LanguageConfig
 * @property {string} template - Describes the format of
 * the generated code
 */


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "expandra.expand",
      expand,
    ),
    vscode.languages.registerCompletionItemProvider(
      { scheme: "file" },
      { provideCompletionItems },
      ">",
      "+",
      "*",
    ),
  );
}

function deactivate() {}

/** Replace the string at the cursor with a snippet
 * of the expanded version of the string, if it
 * follows the proper syntax.
 */
function expand() {
  let editor = vscode.window.activeTextEditor;
  if (!editor) return;

  editor.insertSnippet(
    new vscode.SnippetString(`Put snippet here $1`),
    editor.document.getWordRangeAtPosition(
      editor.selection.active,
    ),
  );
}

/**
 * Returns a list of `CompletionItem`s, which in this
 * case just captures the current "word" as a
 * `CompletionItem` since it will be translated to
 * code.
 * @param {vscode.TextDocument} document
 * @param {vscode.Position} position
 */
function provideCompletionItems(document, position) {
  let lang = vscode.workspace
    .getConfiguration("expandra")
    .get("languages")
    .find((x) => x.lang === document.languageId)?.config ||
    LANGUAGES[document.languageId];
  // If the document language isn't a {user/pre}-
  // configured language, don't do anything
  if (!lang) return;

  let line = document.lineAt(position.line);
  let line_range = word_range(line, position.character);
  // TODO: Fix digits not triggering completion
  let completion = new vscode.CompletionItem(
    line.text.substring(line_range.start, line_range.end),
  );
  completion.range = new vscode.Range(
    position.line,
    line_range.start,
    position.line,
    line_range.end,
  );
  completion.documentation = "Converts the string to source code";
  // Trigger a command to lazily calculate the result
  completion.command = { command: "expandra.expand" };
  // Setting `true` fixes the "UI refresh flash"
  return new vscode.CompletionList([completion], true);
}


/** Starting at an `index` in a `line`, expand outward in both directions
 * until a space is found or there are no more characters.
 * @param {number} line
 * @param {number} index
 */
function word_range(line, index) {
  let i = index;
  let start = index;
  let end = line.range.end.character;
  while (true) {
    if (line.text.charAt(i) === " " || line.text.charAt(i) === "\t") {
      i += 1;
      break;
    }
    if (i == 0) {
      break;
    }
    i--;
  }
  start = i;
  i = index;
  while (i < line.range.end.character) {
    if (line.text.charAt(i) === " " || line.text.charAt(i) === "\t") {
      end = i;
      break;
    }
    i++;
  }
  return { start, end };
}

/** Default `LanguageConfig`s */
const LANGUAGES = {
  html: {
    template: "<{name}>{body}</{name}>",
  },
  pdml: {
    template: "[{name} {body}]",
  },
};

module.exports = {
  activate,
  deactivate,
};
