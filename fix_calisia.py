import sys

with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find line 155 (index 154) and replace it
if len(lines) >= 155:
    # Remove the old line (starting from beginning)
    lines[154] = '  calisiaUI.arama = "";\n'
    lines[155] = '  calisiaUI.ders = "tumu";\n'
    lines[156] = '  calisiaUI.durum = "tumu";\n'

with open('app.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('calisiaUI initialized correctly')
