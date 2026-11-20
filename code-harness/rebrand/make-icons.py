"""Build the web icon set from the Code Harness logo (a black glyph on transparent).

Usage: python3 make-icons.py <logo.png> <out dir>. Needs only the standard library
plus macOS sips for resizing (run on the Mac); outputs are committed.
"""
import base64, struct, subprocess, sys, tempfile, zlib
from pathlib import Path

def read(path):
    data = Path(path).read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    pos, idat, w = 8, b'', None
    while pos < len(data):
        n, kind = struct.unpack('>I4s', data[pos:pos + 8]); body = data[pos + 8:pos + 8 + n]; pos += 12 + n
        if kind == b'IHDR':
            w, h, depth, color, _, _, interlace = struct.unpack('>IIBBBBB', body)
            assert (depth, color, interlace) == (8, 6, 0), 'expects 8-bit RGBA, non-interlaced'
        elif kind == b'IDAT': idat += body
    raw, stride, rows, prev = zlib.decompress(idat), w * 4, [], bytearray(w * 4)
    for y in range(h):
        f, line = raw[y * (stride + 1)], bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        for i in range(stride):
            a = line[i - 4] if i >= 4 else 0; b = prev[i]; c = prev[i - 4] if i >= 4 else 0
            if f == 1: line[i] = (line[i] + a) & 255
            elif f == 2: line[i] = (line[i] + b) & 255
            elif f == 3: line[i] = (line[i] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c; pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[i] = (line[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line); prev = line
    return w, h, rows

def write(path, w, h, rows):
    chunk = lambda k, b: struct.pack('>I', len(b)) + k + b + struct.pack('>I', zlib.crc32(k + b))
    raw = b''.join(b'\x00' + bytes(r) for r in rows)
    Path(path).write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
                           + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

def recolor(rows, rgb):
    return [bytearray(v for x in range(0, len(r), 4) for v in (*rgb, r[x + 3])) for r in rows]

def flatten(rows, bg=(255, 255, 255)):
    out = []
    for r in rows:
        line = bytearray()
        for x in range(0, len(r), 4):
            a = r[x + 3] / 255
            line += bytes(round(r[x + i] * a + bg[i] * (1 - a)) for i in range(3)) + b'\xff'
        out.append(line)
    return out

def sips(src, dst, size, pad=None):
    subprocess.run(['sips', '-z', str(size), str(size), src, '--out', dst], check=True, capture_output=True)
    if pad: subprocess.run(['sips', '-p', str(pad), str(pad), '--padColor', 'FFFFFF', dst, '--out', dst], check=True, capture_output=True)

logo, out = sys.argv[1], Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
w, h, rows = read(logo)
tmp = Path(tempfile.mkdtemp())
write(tmp / 'black.png', w, h, recolor(rows, (0, 0, 0)))
write(tmp / 'white.png', w, h, recolor(rows, (255, 255, 255)))
# Opaque app icons: glyph on white, with room around it (maskable keeps a 20% safe margin).
for name, size, glyph in [('apple-touch-icon.png', 180, 132), ('icon-192.png', 192, 152),
                          ('icon-512.png', 512, 404), ('icon-maskable-512.png', 512, 300)]:
    sips(str(tmp / 'black.png'), str(tmp / name), glyph, pad=size)
    write(out / name, *(lambda w_, h_, r_: (w_, h_, flatten(r_)))(*read(tmp / name)))
# Tab icons: the transparent glyph, black for light themes and white for dark ones.
for variant, name in [('black', 'favicon.svg'), ('white', 'favicon-dark.svg')]:
    sips(str(tmp / f'{variant}.png'), str(tmp / f'{variant}-64.png'), 64)
    data = base64.b64encode((tmp / f'{variant}-64.png').read_bytes()).decode()
    (out / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,{data}"/></svg>\n')
# The glyph the brand plugin uses as a CSS mask, so it takes the theme's text colour.
sips(str(tmp / 'black.png'), str(out / 'mark-128.png'), 128)
print('wrote', sorted(p.name for p in out.iterdir()))
