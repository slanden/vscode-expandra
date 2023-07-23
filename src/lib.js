/** Default `LanguageConfig`s */
const LANGUAGES = {
  json: {
    groupsAreCode: true,
    template:
      `{_ if text|_ indent}{_ if group|_ '\"'}{name}{_ if group|_ '\": '}{'['+node_separator body indent+']' if child_repeats|'\"' body '\"' if child_is_text|body if text|body '$'+counter if empty|'{'+node_separator body indent+'}'}{_ if last_child|_ ','}{_ if text|_ node_separator}`,
  },
  pdml: {
    template: pdml_template(),
  },
  pml: {
    template: pdml_template(),
  },
};

/** Starting at an `index` in a `source`, find the left boundary
 * and move the right boundary outward if necessary to close an
 * open pair of `{}` or `[]`, or until there are no more characters
 * @param {string} source
 * @param {number} index
 */
function expansion_range(source, index) {
  let i = index;
  let start = index;
  let boundary = null;
  let looking_for = [];

  while (i > 0) {
    i--;
    if (
      !boundary && (source.charAt(i) === " " || source.charAt(i) === "\t")
    ) {
      boundary = i + 1;
    } else if (source.charAt(i) === "}") {
      boundary = null;
      looking_for.push("{");
    } else if (source.charAt(i) === "]") {
      boundary = null;
      looking_for.push("[");
    } else if (source.charAt(i) === "{") {
      boundary = null;
      if (looking_for.length && looking_for[looking_for.length - 1] === "{") {
        looking_for.pop();
      } else {
        looking_for.push("}");
      }
    } else if (source.charAt(i) === "[") {
      boundary = null;
      if (looking_for.length && [looking_for.length - 1] === "[") {
        looking_for.pop();
      } else {
        looking_for.push("]");
      }
    }
  }
  start = boundary || i;
  i = index;
  while (looking_for.length && i < source.length) {
    if (source.charAt(i) === looking_for[0]) {
      looking_for.shift();
    }
    i++;
  }
  return { start, end: i };
}

/** Get a list of `DocumentSelector`s for supported and
 * enabled languages.
 *
 * ## Side Effects
 * Since this happens every config change, and on
 * activation, the PDML template is also set here to
 * avoid searching again.
 */
function initDocSelectors(langs) {
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

    if (langs[i].lang === "pdml" || langs[i].lang === "pml") {
      LANGUAGES[langs[i].lang].template = pdml_template(
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
  return `{_ indent}[{name}{` + (
    altAttributeSyntax ? "'(' attributes ')'" : "'[@ ' attributes ']'"
  ) +
    `}{body '$'+counter if empty|node_separator body indent}]{_ node_separator}`;
}

module.exports = {
  expansion_range,
  initDocSelectors,
  pdml_template,
  LANGUAGES,
};
