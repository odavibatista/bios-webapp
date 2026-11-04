"""Gera a fonte de ícones só com os ícones que o app usa (src/styles/icons.json).

A fonte completa do Material Symbols tem quase 4 MB, já comprimidos: num celular em 4G, os ícones
ficariam invisíveis por vários segundos. Ícone novo: acrescente-o a icons.json e rode de novo.

Uso (precisa de `pip install fonttools brotli`): python scripts/subset-icons.py
"""
import json
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'node_modules/material-symbols/material-symbols-outlined.woff2'
TARGET = ROOT / 'src/styles/material-symbols-subset.woff2'
ICONS = json.loads((ROOT / 'src/styles/icons.json').read_text(encoding='utf8'))

font = TTFont(SOURCE)
# O app só usa o desenho padrão: fixar os eixos tira a maior parte do peso da fonte variável.
font = instancer.instantiateVariableFont(font, {'FILL': 0, 'wght': 400, 'GRAD': 0, 'opsz': 24})

to_char = {glyph: chr(code) for code, glyph in font.getBestCmap().items()}
ligatures = {}
for lookup in font['GSUB'].table.LookupList.Lookup:
    for table in lookup.SubTable:
        if table.LookupType == 7:
            table = table.ExtSubTable
        if table.LookupType != 4:
            continue
        for first, entries in table.ligatures.items():
            for entry in entries:
                text = ''.join(to_char.get(glyph, '?') for glyph in [first, *entry.Component])
                ligatures[text] = entry.LigGlyph

missing = [name for name in ICONS if name not in ligatures]
if missing:
    raise SystemExit(f'Ícones que não existem na fonte: {missing}')

keep = {ligatures[name] for name in ICONS}
letters = set(''.join(ICONS))
keep |= {glyph for glyph, char in to_char.items() if char in letters}

options = subset.Options()
options.flavor = 'woff2'
# É por este recurso que o nome do ícone vira desenho: sem ele, a tela mostra letras.
options.layout_features = ['rlig']
# Sem isto, as letras trariam de volta todas as ligaduras, isto é, todos os ícones.
options.layout_closure = False
options.notdef_outline = True
options.name_IDs = [1, 2]
subsetter = subset.Subsetter(options)
subsetter.populate(glyphs=sorted(keep))
subsetter.subset(font)
font.flavor = 'woff2'
font.save(TARGET)
print(f'{len(ICONS)} ícones, {TARGET.stat().st_size / 1024:.1f} KB')
