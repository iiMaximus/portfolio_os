"""Package the generated frame parts and assembled frame for download."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parents[1]
source = root / 'public/models/drone/stl'
archive = source.parent / 'drone-frame-stl.zip'
with ZipFile(archive, 'w', compression=ZIP_DEFLATED) as bundle:
    for file in sorted(source.iterdir()):
        if file.suffix.lower() in ('.stl', '.txt'):
            bundle.write(file, file.name)
with ZipFile(archive) as bundle:
    assert bundle.testzip() is None
    assert len([name for name in bundle.namelist() if name.endswith('.stl')]) == 6
print(f'Packaged five parts and the assembled frame: {archive.name} ({archive.stat().st_size:,} bytes)')
