const vscode = require("vscode");

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
      vscode.CompletionTriggerKind.TriggerCharacter,
      "",
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
  const word = document.getText(
    document.getWordRangeAtPosition(position),
  );
  const completion = new vscode.CompletionItem(word);
  completion.documentation = "Converts the string to source code";
  // Trigger a command to lazily calculate the result
  completion.command = { command: "expandra.expand" };
  // Setting `true` fixes the "UI refresh flash"
  return new vscode.CompletionList([completion], true);
}

module.exports = {
  activate,
  deactivate,
};
