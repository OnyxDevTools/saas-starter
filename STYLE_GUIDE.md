<!-- filename: STYLE_GUIDE.md -->

# SaaS theme: Parchment / Aubergine / Clay

A warm editorial identity distinct from the sibling starters: parchment pages,
cream cards, aubergine actions, clay secondary surfaces, and plum-tinted dark mode.
Manrope is the body font; Lora gives page titles and the wordmark a calmer serif
voice. Fonts are built and served locally through next/font.

Brand colors live in app/globals.css, paired with foregrounds. Sidebar tokens
separate navigation from content, and active links use an explicit selected state
plus aria-current. Rounded controls and larger card radii share the same scale.

To retheme with words, specify surface, action, secondary and ink families, then
change their semantic token pairs in both themes. For example: “warm stone pages,
forest actions and muted brass accents.” Avoid changing individual components.

Keep normal text contrast at least 4.5:1, large text 3:1 and visible focus states.
Check hovered/selected/disabled controls and both themes. Public pages, workspace,
component reference, chart and invitation email all share this visual direction.
