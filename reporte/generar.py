"""Genera assets/docs/reporte-sustentabilidad-cusillos.pdf a partir de reporte/plantilla.html.

Uso (desde la carpeta del proyecto):  python3 reporte/generar.py
Con --vista deja reporte/.armado.html para revisarlo en el navegador.
Toma el mapa de index.html, así que el PDF siempre muestra el mismo mapa que la web.
"""
import datetime, pathlib, re, subprocess, sys

raiz = pathlib.Path(__file__).resolve().parent.parent
html = (raiz / "index.html").read_text(encoding="utf-8")
mapa = re.search(r'<svg class="map".*?</svg>', html, re.S).group(0)
mapa = re.sub(r'<title[^>]*>.*?</title>', "", mapa)

plantilla = (raiz / "reporte" / "plantilla.html").read_text(encoding="utf-8")
salida_html = raiz / "reporte" / ".armado.html"
salida_html.write_text(
    plantilla.replace("{{MAPA}}", mapa).replace("{{ANIO}}", str(datetime.date.today().year)),
    encoding="utf-8",
)

pdf = raiz / "assets" / "docs" / "reporte-sustentabilidad-cusillos.pdf"
pdf.parent.mkdir(parents=True, exist_ok=True)
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
subprocess.run([
    chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
    "--virtual-time-budget=8000", f"--print-to-pdf={pdf}", salida_html.as_uri(),
], check=True, capture_output=True)
if "--vista" not in sys.argv:
    salida_html.unlink()
print(f"PDF listo: {pdf.relative_to(raiz)} ({pdf.stat().st_size / 1024:.0f} KB)")
