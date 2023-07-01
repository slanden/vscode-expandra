# Expandra

Expandra lets you synthesize [PDML](https://pdml-lang.dev/) markup from a condensed representation.
It's inspired by [Emmet](https://emmet.io/), and only exists because Emmet is limited to HTML, with
few exceptions.

## Usage Notes

Expandra behaves similarly to Emmet, but the following is a list of Emmet
features with a brief note whether it's planned to be added or not.

### Item Numbering: $

Not sure - I've never used this, but I'd be interested to hear your thoughts. If
you use this a lot, what do you use it for?

### ID and Class Shortcuts

Not sure - this is useful, but it's tied to HTML. Knowing which attributes to
resolve to in other languages later would need extra work.

### Climb-Up: ^

Not planned - you can already achieve this with groups. Maybe this would make
things more readable if you're doing a lot of grouping, I don't know. If you
disagree though, I'd be interested to hear your thoughts.

### Implicit Tag Names

Not planned - I'm not sure it's worth it. Knowing which tag names to resolve to
in other languages later would need extra work.

### HTML-Specific Transormations

Not planned - other languages are planned to be supported, and this could easily
proliferate extension size and/or memory use. The benefit here might be worth
it, but it might warrant extra syntax to accommodate languages that allow
namespaces. That is, Emmet uses ':' for this, but to specify an XML or PDML
namespace something else would need to be used.

### CSS-Specific Transformations

Not planned - modern code editors auto-complete these anyway so there's little
benefit.

### Tag Name Aliases

Not planned - this could be useful if there are long tag names, which may be the
case in languages other than HTML, but because several languages are planned to be
supported, this might also not be worth it.

## Extension Settings
You can configure supported languages with the `expandra.languages`
setting. More languages are planned, but currently only PDML is supported. You
can also disable expansion for a language.

### Example: Disable expansion for PDML
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
    "settings": { "alternativeAttributeSyntax": true }
  }
]
```

## Known Issues

Text expands as if it was a node, which results in it being on it's own line with
increased indentation.

## Contributing

File bugs, feature requests, or feedback at
[Github Issues](https://github.com/slanden/vscode-expandra/issues).

## License

[MIT License](LICENSE)
