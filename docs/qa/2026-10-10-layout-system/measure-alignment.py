"""Measure border rows in unchanged 2x screenshots of the actual Mac App."""
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parent

def matching_rows(image, xs, ys, color):
    points = range(*xs, 3)
    return [y for y in range(*ys) if sum(
        sum((a-b)**2 for a,b in zip(image.getpixel((x,y)), color)) < 400
        for x in points
    ) / len(points) > .65]

result = {}
for name in ['before-time-step.jpg', 'time-step.jpg', 'time-step-feedback.jpg', 'time-step-final.jpg']:
    image = Image.open(root/name).convert('RGB')
    assert image.size == (3024, 1742), image.size
    left = matching_rows(image, (500,1450), (260,1000), (220,211,187))[0]
    right = matching_rows(image, (1900,2500), (260,1000), (231,215,174))[0]
    result[name] = {'leftCardTopPhysicalPx': left, 'questionCardTopPhysicalPx': right,
                    'differenceLogicalPxAt2x': abs(left-right)/2}
    if name != 'before-time-step.jpg':
        assert abs(left-right) <= 2, result[name]

image = Image.open(root/'choice5-cards-final.jpg').convert('RGB')
left = matching_rows(image, (1840,2120), (1050,1320), (216,223,200))[-1]
right = matching_rows(image, (2380,2620), (1050,1320), (216,223,200))[-1]
result['equalHeightOptions'] = {'leftBottomPhysicalPx': left, 'rightBottomPhysicalPx': right,
                                'differenceLogicalPxAt2x': abs(left-right)/2}
assert abs(left-right) <= 2, result['equalHeightOptions']
(root/'alignment-measurements.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
