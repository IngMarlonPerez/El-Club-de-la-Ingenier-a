"""Arte del certificado "Héroe del Club" (Kernel Cero) — El Club de la Ingeniería.
Mismo motor visual del certificado de Ethos IA (A4 horizontal, 3508 x 2480 px a 300 ppp) con la identidad del Club.

Uso:  python scripts/generar-arte-certificado.py
Genera:
  lib/certificado/assets/club-cert-base.png   fondo SIN nombre, código, fecha ni QR (el servidor los dibuja en el PDF)
  lib/certificado/assets/layout.json          coordenadas donde se dibujan esos datos
  public/cert/club-cert-ejemplo.jpg           imagen limpia para la web (sin nombre ni fecha: la página los superpone)
Las tipografías se toman de Windows (Georgia / Segoe UI); el PDF final no las necesita: ya van horneadas en la imagen.
"""
import json, math, os
import qrcode
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(RAIZ, "public", "logo.png")
ASSETS = os.path.join(RAIZ, "lib", "certificado", "assets")
PUBLIC = os.path.join(RAIZ, "public", "cert")
W, H = 3508, 2480
TINTA, TURQ, GRIS, TURQ_OSC = "#06141c", "#2fd8c9", "#5a6b78", "#0b6f68"
ORO_CLARO, ORO, ORO_OSC = (236, 208, 140), (185, 151, 91), (128, 98, 44)
SEG, SEGB, GEO, GEOB = "segoeui.ttf", "segoeuib.ttf", "georgia.ttf", "georgiab.ttf"
SITIO = "elclubdelaingenieria.dpdns.org"


def F(n, s):
    return ImageFont.truetype("C:/Windows/Fonts/" + n, s)


def mezcla(a, b, t):
    t = max(0, min(1, t))
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def dorado(w, h):
    g = Image.new("RGB", (w, h)); px = g.load()
    for x in range(w):
        t = x / max(w - 1, 1)
        c = mezcla(ORO_OSC, ORO_CLARO, t * 2) if t < .5 else mezcla(ORO_CLARO, ORO_OSC, (t - .5) * 2)
        for y in range(h):
            px[x, y] = c
    return g


def texto_dorado(im, y, t, fn):
    d = ImageDraw.Draw(im); w = int(d.textlength(t, font=fn))
    m = Image.new("L", (w + 20, fn.size * 2), 0); ImageDraw.Draw(m).text((10, 0), t, font=fn, fill=255)
    im.paste(dorado(m.width, m.height), (int(W / 2 - m.width / 2), y), m)


def centrado(d, y, t, fn, fill, x0=0, x1=W, tracking=0):
    if tracking:
        total = sum(d.textlength(c, font=fn) + tracking for c in t) - tracking
        x = (x0 + x1) / 2 - total / 2
        for c in t:
            d.text((x, y), c, font=fn, fill=fill); x += d.textlength(c, font=fn) + tracking
    else:
        d.text(((x0 + x1) / 2 - d.textlength(t, font=fn) / 2, y), t, font=fn, fill=fill)


def parrafo(d, t, fn, ancho, fill, y, inter=1.5):
    lineas, cur = [], ""
    for p in t.split():
        prueba = (cur + " " + p).strip()
        if d.textlength(prueba, font=fn) <= ancho: cur = prueba
        else: lineas.append(cur); cur = p
    lineas.append(cur)
    for l in lineas:
        centrado(d, y, l, fn, fill); y += int(fn.size * inter)
    return y


def guilloche(d, x0, y0, x1, y1, amp=16, ciclos=70, color=(214, 190, 140)):
    for fase in (0, math.pi):
        for hor in (True, False):
            largo = (x1 - x0) if hor else (y1 - y0); a, b = [], []
            for i in range(0, int(largo), 4):
                v = amp * math.sin(2 * math.pi * ciclos * i / largo + fase)
                if hor: a.append((x0 + i, y0 + v)); b.append((x0 + i, y1 + v))
                else: a.append((x0 + v, y0 + i)); b.append((x1 + v, y0 + i))
            d.line(a, fill=color, width=2); d.line(b, fill=color, width=2)


def esquina(d, x, y, sx, sy):
    ang = {(1, 1): (0, 90), (-1, 1): (90, 180), (1, -1): (270, 360), (-1, -1): (180, 270)}[(sx, sy)]
    for r, w in ((150, 6), (118, 3), (86, 3)):
        d.arc([x - r, y - r, x + r, y + r], ang[0], ang[1], fill=ORO, width=w)


def medalla(im, cx, cy, r=225):
    d = ImageDraw.Draw(im)
    d.polygon([(cx - 95, cy), (cx + 95, cy), (cx + 95, cy + 760), (cx, cy + 660), (cx - 95, cy + 760)], fill=TINTA)
    d.line([(cx - 95, cy), (cx - 95, cy + 760), (cx, cy + 660), (cx + 95, cy + 760), (cx + 95, cy)], fill=TURQ, width=5)
    for i in range(r, 0, -2):
        d.ellipse([cx - i, cy - i, cx + i, cy + i], fill=mezcla(ORO_OSC, ORO_CLARO, .25 + (1 - i / r) * 1.1))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=ORO_OSC, width=5)
    d.ellipse([cx - r + 28, cy - r + 28, cx + r - 28, cy + r - 28], outline=(250, 235, 190), width=4)
    d.ellipse([cx - r + 150, cy - r + 150, cx + r - 150, cy + r - 150], fill=TINTA, outline=ORO_OSC, width=5)
    texto, fn = "EL CLUB DE LA INGENIERÍA · MILAGRO, ECUADOR · ", F(SEGB, 29)
    paso, rad = 2 * math.pi / len(texto), r - 88
    capa = Image.new("RGBA", im.size, (0, 0, 0, 0))
    for i, ch in enumerate(texto):
        ang = -math.pi / 2 + i * paso; w = d.textlength(ch, font=fn)
        c = Image.new("RGBA", (110, 110), (0, 0, 0, 0))
        ImageDraw.Draw(c).text((55 - w / 2, 32), ch, font=fn, fill=(70, 50, 15, 255))
        c = c.rotate(-math.degrees(ang) - 90, resample=Image.BICUBIC, center=(55, 55))
        capa.alpha_composite(c, (int(cx + rad * math.cos(ang) - 55), int(cy + rad * math.sin(ang) - 55)))
    im.paste(capa, (0, 0), capa)
    logo = Image.open(LOGO).convert("RGBA"); logo.thumbnail((190, 190))
    im.paste(logo, (cx - logo.width // 2, cy - logo.height // 2), logo)


def base():
    """Devuelve (imagen, layout). La imagen NO incluye nombre, fecha, código ni QR."""
    im = Image.new("RGB", (W, H), "#fdfdfb")
    marca = Image.open(LOGO).convert("RGBA"); marca.thumbnail((1500, 1500))
    marca.putalpha(marca.getchannel("A").point(lambda v: int(v * .05)))
    im.paste(marca, (W // 2 - marca.width // 2, H // 2 - marca.height // 2 + 80), marca)
    d = ImageDraw.Draw(im)
    d.rectangle([110, 110, W - 110, H - 110], outline=ORO, width=7)
    guilloche(d, 150, 150, W - 150, H - 150)
    d.rectangle([205, 205, W - 205, H - 205], outline=ORO, width=3)
    d.rectangle([222, 222, W - 222, H - 222], outline=TINTA, width=2)
    for x, y, sx, sy in ((222, 222, 1, 1), (W - 222, 222, -1, 1), (222, H - 222, 1, -1), (W - 222, H - 222, -1, -1)):
        esquina(d, x, y, sx, sy)
    logo = Image.open(LOGO).convert("RGBA"); logo.thumbnail((200, 200))
    f_marca = F(SEGB, 104); titulo = "EL CLUB DE LA INGENIERÍA"
    x0 = int(W / 2 - (logo.width + 40 + d.textlength(titulo, font=f_marca)) / 2)
    im.paste(logo, (x0, 285), logo)
    d.text((x0 + logo.width + 40, 322), titulo, font=f_marca, fill=TINTA)
    centrado(d, 500, "UNIVERSIDAD ESTATAL DE MILAGRO  ·  ECUADOR", F(SEG, 36), GRIS, tracking=6)
    texto_dorado(im, 610, "RECONOCIMIENTO DE HONOR", F(GEOB, 84)); d = ImageDraw.Draw(im)
    centrado(d, 760, "El Club de la Ingeniería, por autoridad de su Fundador, hace notorio.", F(SEG, 44), TINTA)
    centrado(d, 820, "Que:", F(SEG, 44), TINTA)
    # (aquí va el nombre: se dibuja en el PDF)
    y = parrafo(d, "Ha completado los 31 niveles de Kernel Cero (Operación Laboratorio-B): reconocimiento, comunicación segura, "
                   "detección y respuesta a incidentes, forense digital, pentesting web autorizado, ISO/IEC 27001 y auditoría "
                   "de datacenter y nube, por lo que se le otorga el", F(SEG, 50), 2250, TINTA, 1200, 1.45)
    t = "CERTIFICADO DE HÉROE DEL CLUB"
    fn = F(GEOB, 128)
    while d.textlength(t, font=fn) > W - 900: fn = F(GEOB, fn.size - 4)
    centrado(d, y + 20, t, fn, TINTA)
    y_fecha = y + 215
    medalla(im, W - 560, 470, 225); d = ImageDraw.Draw(im)
    # línea de firma (firma impresa: nombre y cargo del fundador; no se dibuja una firma manuscrita falsa)
    fx0, fx1 = 520, 1480
    d.line([fx0, 2050, fx1, 2050], fill=TINTA, width=3)
    centrado(d, 2068, "Marlon David Pérez Almachi", F(SEGB, 44), TINTA, fx0, fx1)
    centrado(d, 2126, "Fundador · El Club de la Ingeniería", F(SEG, 34), GRIS, fx0, fx1)
    qx = W - 1230
    d.rectangle([qx - 8, 1852, qx + 308, 2168], outline="#d5e0ea", width=3)
    d.text((qx + 350, 1905), "CÓDIGO", font=F(SEGB, 28), fill=GRIS)
    d.text((qx + 350, 2010), "Verifica este documento en", font=F(SEG, 30), fill=GRIS)
    d.text((qx + 350, 2052), SITIO + "/verificar", font=F(SEGB, 28), fill=TURQ_OSC)
    centrado(d, H - 265, "Reconocimiento educativo y simbólico del Club de la Ingeniería. No constituye título académico, "
                         "certificación profesional ni acreditación pericial.", F(SEG, 26), GRIS)
    layout = {"ancho": W, "alto": H, "nombre_y": 930, "nombre_max_ancho": W - 900, "fecha_y": y_fecha, "folio_y": y_fecha + 150,
              "qr": {"x": qx, "y": 1860, "lado": 300}, "codigo": {"x": qx + 350, "y": 1945}, "tinta": TINTA, "gris": GRIS}
    return im, layout


def ejemplo(im, layout):
    """Imagen limpia para la web (sin marca de agua). NO lleva nombre ni fecha: la página los superpone
    (el de la persona registrada, o el de ejemplo). Incluye código y QR de ejemplo (apuntan a un código inexistente)."""
    p = im.copy(); d = ImageDraw.Draw(p)
    q = qrcode.QRCode(box_size=10, border=1); q.add_data("https://%s/verificar/CLUB-CERT-2026-0000" % SITIO); q.make(fit=True)
    qi = q.make_image(fill_color=TINTA, back_color="white").convert("RGB").resize((300, 300), Image.NEAREST)
    p.paste(qi, (layout["qr"]["x"], layout["qr"]["y"]))
    d.text((layout["codigo"]["x"], layout["codigo"]["y"]), "CLUB-CERT-2026-0000", font=F(SEGB, 38), fill=TINTA)
    return p


def composicion_demo(im, layout, nombre, fecha):
    """Solo para revisar el diseño completo con un nombre de ejemplo (no se publica)."""
    p = ejemplo(im, layout); d = ImageDraw.Draw(p)
    fn = F("timesbd.ttf", 150)
    centrado(d, layout["nombre_y"], nombre.upper(), fn, TINTA)
    centrado(d, layout["fecha_y"], "Dado y firmado en Milagro, Ecuador, el %s." % fecha, F(SEG, 44), GRIS)
    return p


if __name__ == "__main__":
    os.makedirs(ASSETS, exist_ok=True); os.makedirs(PUBLIC, exist_ok=True)
    im, layout = base()
    im.save(os.path.join(ASSETS, "club-cert-base.png"), dpi=(300, 300), optimize=True)
    json.dump(layout, open(os.path.join(ASSETS, "layout.json"), "w", encoding="utf-8"), indent=2)
    pv = ejemplo(im, layout); pv.thumbnail((1700, 1700))
    pv.save(os.path.join(PUBLIC, "club-cert-ejemplo.jpg"), quality=88, optimize=True, progressive=True)
    old = os.path.join(PUBLIC, "club-cert-preview.jpg")
    if os.path.exists(old): os.remove(old)
    import sys
    if len(sys.argv) > 1:   # python scripts/generar-arte-certificado.py demo ruta_salida.png
        composicion_demo(im, layout, "Victor Lluilema", "17 de octubre de 2026").resize((1700, int(1700 * H / W))).save(sys.argv[1])
    print("ok", os.path.getsize(os.path.join(ASSETS, "club-cert-base.png")) // 1024, "KB base;",
          os.path.getsize(os.path.join(PUBLIC, "club-cert-ejemplo.jpg")) // 1024, "KB ejemplo")
