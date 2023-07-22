const vscode = require("vscode");

/** Default `LanguageConfig`s */
const LANGUAGES = {
  pdml: {
    template: pdml_template(),
  },
};

/** Get a list of `DocumentSelector`s for supported and
 * enabled languages.
 *
 * ## Side Effects
 * Since this happens every config change, and on
 * activation, the PDML template is also set here to
 * avoid searching again.
 */
function initDocSelectors() {
  let langs = vscode.workspace
    .getConfiguration("expandra")
    .get("languages");
  let docSelectors = [];
  let visited = new Map();
  for (let i = 0; i < langs.length; ++i) {
    if (!LANGUAGES[langs[i].lang]) continue;

    visited.set(langs[i].lang);
    if (langs[i].disable) continue;
    docSelectors.push({
      scheme: "file",
      language: langs[i].lang,
    });

    if (langs[i].lang === "pdml") {
      LANGUAGES.pdml.template = pdml_template(
        langs[i].settings?.alternativeAttributeSyntax,
      );
    }
  }
  for (let key in LANGUAGES) {
    if (visited.has(key)) continue;
    docSelectors.push({ scheme: "file", language: key });
  }
  return docSelectors;
}

/** Get the PDML template that should be used.
 * @param {Boolean} altAttributeSyntax Use PDML's
 * alternative attribute syntax in the template
 */
function pdml_template(altAttributeSyntax = false) {
  return altAttributeSyntax
    ? "[{name}{' (' attributes ')'}{body}]"
    : "[{name}{' [@ ' attributes ']'}{body}]";
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

/** Starting at an `index` in a `line`, expand outward in both
 * directions until a space is found that is not inside a `{}`
 * pair, or there are no more characters.
 * @param {number} line
 * @param {number} index
 */
function expansion_range(line, index) {
  let i = index;
  let start = index;
  let end = line.range.end.character;
  // The char after a space when moving left, or before it when moving right
  let boundary = null;
  while (true) {
    if (
      !boundary && (line.text.charAt(i) === " " || line.text.charAt(i) === "\t")
    ) {
      boundary = i + 1;
    } else if (line.text.charAt(i) === "{") {
      boundary = null;
    }
    if (i == 0) {
      break;
    }
    i--;
  }
  start = boundary || i;
  i = index;
  boundary = null;
  while (i < line.range.end.character) {
    if (
      !boundary && (line.text.charAt(i) === " " || line.text.charAt(i) === "\t")
    ) {
      boundary = i;
    } else if (line.text.charAt(i) === "}") {
      boundary = null;
    }
    i++;
  }
  end = boundary || i;
  return { start, end };
}

module.exports = {
  expansion_range,
  initDocSelectors,
  pdml_template,
  word_range,
  LANGUAGES,
};
