const vscode = require("vscode");
const core = require("../core/expandra");
const {
  expansion_range,
  initDocSelectors,
  LANGUAGES,
} = require("./lib.js");

/** Configures Expandra for a specific language
 * @typedef LanguageConfig
 * @property {boolean} groupsAreCode - Whether the groups
 * from the expansion string can be part of the template,
 * i.e. have {pre,suf}fixes, add indententation, etc.
 * @property {string} template - Describes the format of
 * the generated code
 */

/** UTF-8 encoder */
const UTF8 = (() => {
  let dec = new TextDecoder();
  let enc = new TextEncoder();
  return {
    // Must bind; probably becuase the methods' `this`
    // is literally this, but they expect the `this`
    // of their respective objects
    decode: dec.decode.bind(dec),
    encode: enc.encode.bind(enc),
  };
})();
let completionSubscriptionIndex;
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "expandra.expand",
      expand,
    ),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("expandra.languages")) {
        let docSelectors = initDocSelectors();
        if (completionSubscriptionIndex !== undefined) {
          context.subscriptions[completionSubscriptionIndex]
            .dispose();
          if (docSelectors.length) {
            context.subscriptions[completionSubscriptionIndex] = vscode
              .languages.registerCompletionItemProvider(
                docSelectors,
                { provideCompletionItems },
                ">",
                "+",
                "*",
              );
          }
        } else if (docSelectors.length) {
          context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
              docSelectors,
              { provideCompletionItems },
              ">",
              "+",
              "*",
            ),
          );
        }
      }
    }),
  );
  let docSelectors = initDocSelectors();
  if (docSelectors.length) {
    completionSubscriptionIndex = context.subscriptions.length;
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        docSelectors,
        { provideCompletionItems },
        ">",
        "+",
        "*",
      ),
    );
  }
}

function deactivate() {}

/** Replace the string at the cursor with a snippet
 * of the expanded version of the string, if it
 * follows the proper syntax.
 * @param {LanguageConfig} lang
 * @param {vscode.Range} range
 */
function expand(lang, range) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) return;

  let res = UTF8.decode(core.wasm_expand(
    UTF8.encode(editor.document.getText(range)),
    UTF8.encode(lang.template),
    lang.groupsAreCode || false,
  ));
  editor.insertSnippet(
    new vscode.SnippetString(res),
    range,
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
  // This won't work if a user associated other file
  // extension with a specific language
  // let lang_id = document.fileName.lastIndexOf(".");
  // lang_id = lang_id != -1
  //   ? document.fileName.substring(lang_id + 1)
  //   : document.languageId;

  let lang = vscode.workspace
    .getConfiguration("expandra")
    .get("languages")
    ?.find((x) => x.lang === document.languageId)
    ?.config ||
    LANGUAGES[document.languageId];
  // If the document language isn't a {user/pre}-
  // configured language, don't do anything
  if (!lang) return;

  let line = document.lineAt(position.line);
  let line_range = expansion_range(line, position.character);
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
  completion.command = {
    command: "expandra.expand",
    arguments: [lang, completion.range],
  };
  // Setting `true` fixes the "UI refresh flash"
  return new vscode.CompletionList([completion], true);
}

module.exports = {
  activate,
  deactivate,
};
