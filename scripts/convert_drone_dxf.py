"""Convert the supplied planar DXFs to closed, millimetre-based render profiles.

No CAD dependency required: these files use LINE, ARC, CIRCLE and non-rational
B-splines. Unsupported geometry, open contours and non-mm files fail explicitly.
The originals are retained unchanged. This is a display conversion, not CAM output.
"""
import hashlib
import json
import math
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'src/models/drone/cad'
OUTPUT = ROOT / 'src/models/drone/frameProfiles.json'
TOLERANCE = 0.015  # maximum curve chord deviation, mm
JOIN_TOLERANCE = 0.0001
FILES = {'bottom':'bottom_frame.DXF', 'top':'top_frame.DXF', 'frontArm':'front_arm_v7.dxf', 'rearArm':'rear_arm.dxf', 'xplate':'xplate.dxf'}
# Shared mounting holes align both body plates to the xplate coordinate system.
BODY_ORIGIN = (5.1854304636, -1.9699633624)


def read_entities(path):
    lines = path.read_text(encoding='cp1252').splitlines()
    pairs = [(int(lines[i].strip()), lines[i+1].strip()) for i in range(0, len(lines)-1, 2)]
    units = next(pairs[i+1][1] for i, pair in enumerate(pairs) if pair == (9, '$INSUNITS'))
    assert units == '4', f'{path.name}: expected millimetres'
    active = False
    entities = []
    current = None
    for code, value in pairs:
        if code == 2 and value == 'ENTITIES': active = True
        elif active and code == 0:
            if current: entities.append(current)
            if value == 'ENDSEC': break
            current = (value, [])
        elif active and current: current[1].append((code, value))
    return entities


def distance(a, b): return math.hypot(a[0]-b[0], a[1]-b[1])
def area(points): return sum(a[0]*b[1]-b[0]*a[1] for a, b in zip(points, points[1:]+points[:1])) / 2


def spline_points(values):
    d = dict(values)
    assert not int(d[70]) & 4, 'Rational spline requires explicit weights'
    degree = int(d[71])
    knots = [float(v) for k,v in values if k == 40]
    xs = [float(v) for k,v in values if k == 10]
    ys = [float(v) for k,v in values if k == 20]
    controls = list(zip(xs, ys))
    def at(u):
        span = next((i for i in range(degree, len(controls)) if knots[i] <= u < knots[i+1]), len(controls)-1)
        pts = [list(controls[j+span-degree]) for j in range(degree+1)]
        for r in range(1, degree+1):
            for j in range(degree, r-1, -1):
                lo, hi = knots[j+span-degree], knots[j+span-r+1]
                alpha = (u-lo)/(hi-lo) if hi != lo else 0
                pts[j] = [(1-alpha)*pts[j-1][axis]+alpha*pts[j][axis] for axis in [0,1]]
        return pts[degree]
    def subdivide(a,b,depth=0):
        pa,pb=at(a),at(b)
        error=max(distance(at(a+(b-a)*t), [(1-t)*pa[i]+t*pb[i] for i in [0,1]]) for t in [.25,.5,.75])
        if error <= TOLERANCE or depth >= 18: return [pa,pb]
        mid=(a+b)/2
        return subdivide(a,mid,depth+1)[:-1]+subdivide(mid,b,depth+1)
    spans=sorted(set(knots[degree:len(controls)+1])); result=[]
    for a,b in zip(spans,spans[1:]): result.extend(subdivide(a,b)[:-1])
    result.append(at(spans[-1]))
    return result


def inside(point, polygon):
    x,y=point; result=False
    for a,b in zip(polygon,polygon[1:]+polygon[:1]):
        if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:result=not result
    return result


def convert(key, filename):
    path=SOURCE/filename; entities=read_entities(path); segments=[]; circles=[]
    origin=BODY_ORIGIN if key in ('bottom','top') else (0,0)
    def shift(p):return [p[i]-origin[i] for i in [0,1]]
    for typ, values in entities:
        d=dict(values)
        if typ=='MTEXT':continue  # drafting annotations, never cut geometry
        if typ=='CIRCLE':
            circles.append({'center':shift([float(d[10]),float(d[20])]),'radius':float(d[40])});continue
        if typ=='LINE':pts=[[float(d[10]),float(d[20])],[float(d[11]),float(d[21])]]
        elif typ=='ARC':
            cx,cy,r=float(d[10]),float(d[20]),float(d[40]); start=math.radians(float(d[50])); span=math.radians((float(d[51])-float(d[50]))%360)
            step=2*math.acos(max(-1,1-TOLERANCE/r)); count=max(2,math.ceil(span/min(step,math.pi/16)))
            pts=[[cx+r*math.cos(start+span*i/count),cy+r*math.sin(start+span*i/count)] for i in range(count+1)]
        elif typ=='SPLINE':pts=spline_points(values)
        else:raise ValueError(f'Unsupported entity {typ} in {filename}')
        segments.append([shift(p) for p in pts])
    loops=[]
    while segments:
        chain=segments.pop(0)
        while distance(chain[0],chain[-1])>JOIN_TOLERANCE:
            candidates=[(distance(chain[-1],seg[end]),i,end) for i,seg in enumerate(segments) for end in (0,-1)]
            gap,index,end=min(candidates,default=(float('inf'),0,0))
            assert gap<=JOIN_TOLERANCE, f'{filename}: open contour at {chain[-1]}, nearest gap {gap}mm'
            seg=segments.pop(index)
            if end==-1:seg.reverse()
            chain.extend(seg[1:])
        loops.append(chain[:-1])
    loops.sort(key=lambda l:abs(area(l)),reverse=True)
    outer,*holes=loops
    assert all(inside(h[0],outer) for h in holes), f'{filename}: separate bodies need explicit classification'
    assert all(inside(c['center'],outer) for c in circles), f'{filename}: outside circle'
    def rounded(p):return [round(v,5) for v in p]
    result={'source':filename,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'sourceOrigin':list(origin),'outer':[rounded(p) for p in outer],'cutouts':[[rounded(p) for p in h] for h in holes],'holes':[{'center':rounded(c['center']),'radius':round(c['radius'],5)} for c in circles],'bounds':[rounded([min(p[i] for p in outer) for i in [0,1]]),rounded([max(p[i] for p in outer) for i in [0,1]])],'areaMm2':round(abs(area(outer))-sum(abs(area(h)) for h in holes)-sum(math.pi*c['radius']**2 for c in circles),3),'entityCounts':dict(Counter(t for t,_ in entities))}
    print(f'{filename}: {len(outer)} perimeter points, {len(holes)} cutouts, {len(circles)} circular holes, bounds {result["bounds"]}')
    return result


if __name__=='__main__':
    data={'units':'mm','chordToleranceMm':TOLERANCE,'profiles':{key:convert(key,file) for key,file in FILES.items()}}
    OUTPUT.write_text(json.dumps(data,separators=(',',':'))+'\n')
