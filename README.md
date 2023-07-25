# Expandra
Expandra lets you synthesize [PDML](https://pdml-lang.dev/) markup from a condensed representation. It uses a subset of [Emmet](https://emmet.io/) syntax.

## Features
- Expansion via the suggestion list
- Expansion via the Command Palette for the active text selection
- Support for PDML and PML
- Experimental, limited JSON support

### Unimplemented Emmet Features
Most of Emmet's features are not implemented in Expandra, and some are not planned. Below is a list of the important ones that might trip you up, along with brief notes on whether features are planned or not.

#### Item Numbering: $
Not sure - I've never used this, but I'd be interested to hear your thoughts. If you use this a lot, what do you use it for?

#### ID and Class Shortcuts
Not sure - this is useful, but it's tied to HTML. Knowing which attributes to resolve to in other languages later would need extra logic.

#### Climb-Up: ^
Not planned - you can already achieve this with groups. Maybe this would make things more readable if you're doing a lot of grouping, I don't know. If you disagree, I'd be interested to hear your thoughts.

#### CSS-Specific Transformations
Not planned - modern code editors auto-complete these anyway so there's little
benefit.

#### HTML-Specific Transormations
Not planned - other languages are planned to be supported, and this could easily proliferate extension size and/or memory use. The benefit here might be worth it, but it might warrant extra syntax to accommodate languages that allow namespaces. That is, Emmet uses ':' for this, but to specify an XML or PDML namespace something else would need to be used.

#### Implicit Tag Names
Not planned - I'm not sure it's worth it. Knowing which tag names to resolve to in other languages later would need extra logic.

#### Tag Name Aliases
Not planned - this could be useful if there are long tag names, which may be the case in languages other than HTML, but because several languages are planned to be supported, this might also not be worth it.

## Extension Settings
You can configure settings for supported languages with the `expandra.languages`
setting. Currently, only PDML is supported and JSON is experimental. You
can also disable expansion for a language.

### Example: Disable Expansion for PDML
```
"expandra.languages": [
  {
    "lang": "pdml",
    "disable": true
  }
]
```

A supported language might have its own settings.

### Example: Alternative PDML Attribute Syntax
PDML attributes are wrapped by delimiters, of which there are two variations. The
default is `[@ ... ]`. The *alternative* is `( ... )`. To use the alternative, you
can use the following configuration.

```
"expandra.languages": [
  {
    "lang": "pdml",
    "settings": {
      "alternativeAttributeSyntax": true
    }
  }
]
```

## Experimental JSON Support
Only basic tests have been done. Also, the groups specified in an expansion string have an additional meaning for JSON.

In nestable markup languages like PDML, a group is used in the expansion string to determine the parent for a group of elements, and nothing more. In JSON, it also means, "wrap these elements inside `{}`". This is because JSON doesn't look the same at every level. You must first nest it in a top-level `{}`. Then, sometimes children are wrapped in `{}`, and sometimes not.

### Example
In PDML, the expansion string `items>(id+name)*2` would mean the following.
```
[items
  [id]
  [name]
  [id]
  [name]
]
```

In JSON, that would be:
```
"items": [
  {
    "id": $,
    "name": $
  },
  {
    "id": $,
    "name": $
  }
]
```
`items` has two children instead of four.

> Note: the '$' is just a placeholder for cursors in VS Code

You can insert that into a JSON object, but if you need it to be its own JSON object, you could wrap the whole expansion string in `()` to get that top-level `{}`.
`(items>(id+name)*2)`:
```
{
  "items": [
    {
      "id": $,
      "name": $
    },
    {
      "id": $,
      "name": $
    }
  ]
}
```

## Known Issues
- Text expands as if it was an element, which results in it being on it's own line with increased indentation
- An expansion string like `(b)[attr]` currently puts the `attr` attribute on the `b`, even though it's nested in a group, because it's undecided what should happen since implicit elements aren't supported
- Expanding JSON can give the wrong output, such as in `id+name*2`. In that case, `name` is not a sibling of `id` but a child. However, `id+name` without the repetition works as you'd expect

## Contributing
File bugs, feature requests, or feedback at
[Github Issues](https://github.com/slanden/vscode-expandra/issues).

## License
[MIT License](LICENSE)
