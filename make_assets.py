import struct, zlib, os

def make_png():
    sig = b'\x89PNG\r\n\x1a\n'
    def chunk(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t+d) & 0xffffffff)
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', 1, 1, 8, 2, 0, 0, 0))
    idat = chunk(b'IDAT', zlib.compress(b'\x00\xff\xff\xff'))
    iend = chunk(b'IEND', b'')
    return sig + ihdr + idat + iend

png = make_png()
os.makedirs('public/images', exist_ok=True)
os.makedirs('public/teasers', exist_ok=True)
os.makedirs('public/docs', exist_ok=True)
os.makedirs('public/audit', exist_ok=True)

for f in ['En0','En1','En2','En3','En4','JP0','JP1','JP2','JP3','JP4','JP5','JP6','white1','white2','white3']:
    open(f'public/images/{f}.png', 'wb').write(png)

for f in ['aces-logo','cyber-cross-logo','logo','og','scan-demo','GBD','Haikeinashi','hais-tech-logo']:
    open(f'public/{f}.png', 'wb').write(png)

open('public/header-bg.jpg', 'wb').write(png)

for f in ['public/3.mp4','public/9.mp4','public/hero-movie2.mp4','public/soluna_rnb.mp3','public/images/hero-movie-v3.mp4','public/teasers/day1.mp4']:
    open(f, 'wb').close()
