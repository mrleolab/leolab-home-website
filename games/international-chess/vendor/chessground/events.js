import * as drag from './drag.js';
import * as draw from './draw.js';
import { drop } from './drop.js';
import { isRightButton } from './util.js';
// binds events to managed nodes,
// i.e. nodes that can be created and deleted by chessground.
// Unbinding these is not necessary, as they will be garbage collected with the nodes.
export function bindBoard(s) {
    const boardEl = s.dom.elements.board;
    if (s.disableContextMenu || s.drawable.enabled) {
        boardEl.addEventListener('contextmenu', e => e.preventDefault());
    }
    if (s.viewOnly)
        return;
    // Cannot be passive, because we prevent touch scrolling and dragging of
    // selected elements.
    const onStart = startDragOrDraw(s);
    boardEl.addEventListener('touchstart', onStart, {
        passive: false,
    });
    boardEl.addEventListener('mousedown', onStart, {
        passive: false,
    });
}
// binds events to unmanaged nodes, i.e. the document around chessground,
// and the wrap element on which chessground was applied.
// returns the unbind function so chessground can clean up on destroy.
export function bindDocument(s, onResize) {
    const unbinds = [];
    if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(onResize);
        ro.observe(s.dom.elements.wrap);
        unbinds.push(() => ro.disconnect());
    }
    // Old versions of Edge and Safari do not support ResizeObserver. Send
    // chessground.resize if a user action has changed the bounds of the board.
    else
        unbinds.push(unbindable(document.body, 'chessground.resize', onResize));
    if (!s.viewOnly) {
        const onmove = dragOrDraw(s, drag.move, draw.move);
        const onend = dragOrDraw(s, drag.end, draw.end);
        for (const ev of ['touchmove', 'mousemove'])
            unbinds.push(unbindable(document, ev, onmove));
        for (const ev of ['touchend', 'mouseup'])
            unbinds.push(unbindable(document, ev, onend));
        const onScroll = () => s.dom.bounds.clear();
        unbinds.push(unbindable(document, 'scroll', onScroll, { capture: true, passive: true }));
        unbinds.push(unbindable(window, 'resize', onScroll, { passive: true }));
    }
    return () => unbinds.forEach(f => f());
}
function unbindable(el, eventName, callback, options) {
    el.addEventListener(eventName, callback, options);
    return () => el.removeEventListener(eventName, callback, options);
}
const startDragOrDraw = (s) => e => {
    if (s.draggable.current)
        drag.cancel(s);
    else if (s.drawable.current)
        draw.cancel(s);
    else if (e.shiftKey || isRightButton(e)) {
        if (s.drawable.enabled)
            draw.start(s, e);
    }
    else if (!s.viewOnly) {
        if (s.dropmode.active)
            drop(s, e);
        else
            drag.start(s, e);
    }
};
const dragOrDraw = (s, withDrag, withDraw) => e => {
    if (s.drawable.current) {
        if (s.drawable.enabled)
            withDraw(s, e);
    }
    else if (!s.viewOnly)
        withDrag(s, e);
};
//# sourceMappingURL=events.js.map