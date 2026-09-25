// Passed to page.evaluate: inspect the DOM without scrolling or changing it.
export function readPrimaryActions() {
  const actions = [...document.querySelectorAll('.object-quest .workbench-next, .quest-finish .finish-navigation button')].map(button => {
    const r = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    const insetX = Math.min(8, r.width / 2), insetY = Math.min(8, r.height / 2);
    const points = [
      [r.left + r.width / 2, r.top + r.height / 2],
      [r.left + insetX, r.top + insetY], [r.right - insetX, r.top + insetY],
      [r.left + insetX, r.bottom - insetY], [r.right - insetX, r.bottom - insetY],
    ];
    const blockers = points.flatMap(([x, y]) => {
      const hit = document.elementFromPoint(x, y);
      return hit && button.contains(hit) ? [] : [hit ? `${hit.tagName}.${hit.getAttribute('class') ?? ''}` : 'outside viewport'];
    });
    const clippedBy = [];
    for (let parent = button.parentElement; parent; parent = parent.parentElement) {
      const p = parent.getBoundingClientRect(), css = getComputedStyle(parent);
      const clipsX = /hidden|clip|auto|scroll/.test(css.overflowX);
      const clipsY = /hidden|clip|auto|scroll/.test(css.overflowY);
      if ((clipsX && (r.left < p.left + parent.clientLeft - 1 || r.right > p.left + parent.clientLeft + parent.clientWidth + 1)) ||
          (clipsY && (r.top < p.top + parent.clientTop - 1 || r.bottom > p.top + parent.clientTop + parent.clientHeight + 1))) {
        clippedBy.push(`${parent.tagName}.${parent.getAttribute('class') ?? ''}`);
      }
    }
    return {
      label: button.getAttribute('aria-label') || button.textContent.trim(),
      rect: {left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height},
      rendered: r.width > 0 && r.height > 0 && style.visibility === 'visible' && Number(style.opacity) > 0,
      blockers: [...new Set(blockers)], clippedBy,
    };
  });
  return {viewport:{width:innerWidth, height:innerHeight}, scroll:{x:scrollX, y:scrollY}, actions};
}

export function primaryActionFailures(snapshot, {required = false} = {}) {
  const failures = [];
  if (required && !snapshot.actions.length) failures.push('主按钮缺失');
  if (snapshot.actions.length && (Math.abs(snapshot.scroll.x) > 1 || Math.abs(snapshot.scroll.y) > 1)) failures.push('任务页已经滚动，不能据此判定首屏可见');
  for (const action of snapshot.actions) {
    const {rect:r, label} = action;
    if (!action.rendered) failures.push(`${label}：主按钮不可见`);
    if (r.left < -1 || r.top < -1 || r.right > snapshot.viewport.width + 1 || r.bottom > snapshot.viewport.height + 1) failures.push(`${label}：主按钮越出视口`);
    if (action.clippedBy.length) failures.push(`${label}：被祖先容器裁切 (${action.clippedBy.join(', ')})`);
    if (action.blockers.length) failures.push(`${label}：主按钮被遮挡 (${action.blockers.join(', ')})`);
  }
  return failures;
}
