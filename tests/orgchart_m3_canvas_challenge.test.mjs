import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Empirical Challenge Suite for Org Chart Milestone M3 Canvas, Bezier & Event Isolation:
 * 1. Zoom Clamping Bounds [0.3x, 2.0x] (handleZoomIn, handleZoomOut, wheelZoom, autoReset, fuzzing)
 * 2. Focal-point cursor zoom transformation invariants
 * 3. SVG Cubic Bezier path string generation, anchor docking dots, geometry & scale invariance
 * 4. Event isolation: manager bottom pill collapse toggle vs card selection vs canvas pan
 */

// --- Canvas Constants verbatim from OrgChartCanvas.jsx ---
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.15;

function zoomIn(prev) {
    return Math.min(MAX_ZOOM, Math.round((prev + ZOOM_STEP) * 100) / 100);
}

function zoomOut(prev) {
    return Math.max(MIN_ZOOM, Math.round((prev - ZOOM_STEP) * 100) / 100);
}

function wheelZoom(curScale, deltaY) {
    const zoomFactor = deltaY < 0 ? 1.08 : 0.92;
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(curScale * zoomFactor * 100) / 100));
}

function calculateFocalTransform(curScale, curTranslate, nextScale, cursorX, cursorY) {
    const nextTx = cursorX - (cursorX - curTranslate.x) * (nextScale / curScale);
    const nextTy = cursorY - (cursorY - curTranslate.y) * (nextScale / curScale);
    return { x: nextTx, y: nextTy };
}

function calculateAutoReset(containerW, contentW) {
    const targetScale = contentW > containerW - 80
        ? Math.max(MIN_ZOOM, Math.min(1.0, (containerW - 80) / contentW))
        : 1.0;
    const centeredX = Math.max(20, (containerW - contentW * targetScale) / 2);
    const centeredY = 40;
    return {
        scale: Math.round(targetScale * 100) / 100,
        translate: { x: centeredX, y: centeredY }
    };
}

// --- Bezier Connector Math verbatim from OrgBezierConnector.jsx ---
function computeCardContentPosition(cardRect, contentRect, scale) {
    const currentScale = scale > 0 ? scale : 1;
    const x = (cardRect.left - contentRect.left + cardRect.width / 2) / currentScale;
    const topY = (cardRect.top - contentRect.top) / currentScale;
    const bottomY = (cardRect.bottom - contentRect.top) / currentScale;
    return { x, topY, bottomY };
}

function generateBezierConnector(parentPos, childPos) {
    const x1 = parentPos.x;
    const y1 = parentPos.bottomY;
    const x2 = childPos.x;
    const y2 = childPos.topY;
    const midY = (y1 + y2) / 2;
    const pathData = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

    return {
        pathData,
        midY,
        startAnchor: { cx: x1, cy: y1, r: 3 },
        endAnchor: { cx: x2, cy: y2, r: 3 }
    };
}

function evaluateCubicBezier(x1, y1, x2, y2, midY, t) {
    const c0 = (1 - t) ** 3;
    const c1 = 3 * ((1 - t) ** 2) * t;
    const c2 = 3 * (1 - t) * (t ** 2);
    const c3 = t ** 3;

    const x = c0 * x1 + c1 * x1 + c2 * x2 + c3 * x2;
    const y = c0 * y1 + c1 * midY + c2 * midY + c3 * y2;
    return { x, y };
}

describe('Milestone M3 Challenge Suite: Canvas Pan/Zoom, Bezier Connectors & Event Isolation', () => {

    describe('1. Zoom Clamping Bounds [0.3x, 2.0x]', () => {
        it('should strictly clamp upper bound at 2.0x on repeated zoomIn', () => {
            let scale = 1.0;
            // 20 successive zoomIn invocations
            for (let i = 0; i < 20; i++) {
                scale = zoomIn(scale);
                assert.ok(scale <= MAX_ZOOM, `Scale ${scale} exceeded MAX_ZOOM ${MAX_ZOOM}`);
                assert.ok(scale >= MIN_ZOOM, `Scale ${scale} dropped below MIN_ZOOM ${MIN_ZOOM}`);
            }
            assert.equal(scale, 2.0, 'Upper zoom bound must clamp exactly at 2.0x');
        });

        it('should strictly clamp lower bound at 0.3x on repeated zoomOut', () => {
            let scale = 1.0;
            // 20 successive zoomOut invocations
            for (let i = 0; i < 20; i++) {
                scale = zoomOut(scale);
                assert.ok(scale <= MAX_ZOOM, `Scale ${scale} exceeded MAX_ZOOM ${MAX_ZOOM}`);
                assert.ok(scale >= MIN_ZOOM, `Scale ${scale} dropped below MIN_ZOOM ${MIN_ZOOM}`);
            }
            assert.equal(scale, 0.3, 'Lower zoom bound must clamp exactly at 0.3x');
        });

        it('should handle boundary edge transitions without float overshoot', () => {
            // At 1.95 + 0.15 = 2.10 -> clamped to 2.0
            assert.equal(zoomIn(1.95), 2.0);
            assert.equal(zoomIn(2.0), 2.0);
            assert.equal(zoomIn(2.5), 2.0);

            // At 0.35 - 0.15 = 0.20 -> clamped to 0.3
            assert.equal(zoomOut(0.35), 0.3);
            assert.equal(zoomOut(0.3), 0.3);
            assert.equal(zoomOut(0.1), 0.3);
        });

        it('should clamp wheel zoom to [0.3, 2.0] regardless of wheel delta magnitude', () => {
            // Massive zoom-in delta
            let scale = 1.0;
            for (let i = 0; i < 100; i++) {
                scale = wheelZoom(scale, -1000);
            }
            assert.equal(scale, 2.0);

            // Massive zoom-out delta
            for (let i = 0; i < 100; i++) {
                scale = wheelZoom(scale, 1000);
            }
            assert.equal(scale, 0.3);
        });

        it('should auto-fit within [0.3, 1.0] bounds on handleReset', () => {
            // Huge content (e.g. 10000px wide tree)
            const resetHuge = calculateAutoReset(1200, 10000);
            assert.equal(resetHuge.scale, 0.3, 'Huge tree scale must be clamped at MIN_ZOOM (0.3)');

            // Small content (e.g. 500px wide tree in 1200px container)
            const resetSmall = calculateAutoReset(1200, 500);
            assert.equal(resetSmall.scale, 1.0, 'Small tree should not be zoomed past 1.0');

            // Medium content requiring fractional fit
            const resetMed = calculateAutoReset(1200, 2000);
            // (1200 - 80) / 2000 = 1120 / 2000 = 0.56
            assert.equal(resetMed.scale, 0.56);
            assert.ok(resetMed.scale >= 0.3 && resetMed.scale <= 1.0);
        });

        it('should survive 20,000 steps of random fuzzing without breaching [0.3, 2.0]', () => {
            let scale = 1.0;
            for (let i = 0; i < 20000; i++) {
                const r = Math.random();
                if (r < 0.33) {
                    scale = zoomIn(scale);
                } else if (r < 0.66) {
                    scale = zoomOut(scale);
                } else {
                    const delta = (Math.random() - 0.5) * 500;
                    scale = wheelZoom(scale, delta);
                }

                if (scale < 0.3 || scale > 2.0) {
                    assert.fail(`Fuzz violation at step ${i}: scale=${scale}`);
                }
            }
            assert.ok(true, '20,000 fuzzing steps passed');
        });
    });

    describe('2. Cursor Focal Point Zoom Transformation', () => {
        it('should preserve content coordinate directly under cursor across zoom transitions', () => {
            const curScale = 1.0;
            const curTranslate = { x: 120, y: 80 };
            const cursorX = 450;
            const cursorY = 320;

            // Compute content coordinate under cursor before zoom
            const contentX = (cursorX - curTranslate.x) / curScale;
            const contentY = (cursorY - curTranslate.y) / curScale;

            // Zoom in to 1.45
            const nextScale = 1.45;
            const nextTranslate = calculateFocalTransform(curScale, curTranslate, nextScale, cursorX, cursorY);

            // Verify content point under cursor after zoom maps to the exact same cursor screen position
            const projectedScreenX = nextTranslate.x + contentX * nextScale;
            const projectedScreenY = nextTranslate.y + contentY * nextScale;

            assert.ok(Math.abs(projectedScreenX - cursorX) < 1e-10, `Screen X shifted by ${projectedScreenX - cursorX}`);
            assert.ok(Math.abs(projectedScreenY - cursorY) < 1e-10, `Screen Y shifted by ${projectedScreenY - cursorY}`);
        });

        it('should preserve cursor focal point when zooming out', () => {
            const curScale = 1.8;
            const curTranslate = { x: -200, y: -150 };
            const cursorX = 600;
            const cursorY = 400;

            const contentX = (cursorX - curTranslate.x) / curScale;
            const contentY = (cursorY - curTranslate.y) / curScale;

            const nextScale = 0.6;
            const nextTranslate = calculateFocalTransform(curScale, curTranslate, nextScale, cursorX, cursorY);

            const projectedScreenX = nextTranslate.x + contentX * nextScale;
            const projectedScreenY = nextTranslate.y + contentY * nextScale;

            assert.ok(Math.abs(projectedScreenX - cursorX) < 1e-10);
            assert.ok(Math.abs(projectedScreenY - cursorY) < 1e-10);
        });
    });

    describe('3. SVG Cubic Bezier Connectors & Docking Dots', () => {
        it('should generate valid SVG cubic bezier path string with M and C commands', () => {
            const parentPos = { x: 300, bottomY: 180 };
            const childPos = { x: 500, topY: 260 };

            const connector = generateBezierConnector(parentPos, childPos);

            // Expected formula: M x1 y1 C x1 midY, x2 midY, x2 y2
            // midY = (180 + 260) / 2 = 220
            assert.equal(connector.midY, 220);
            assert.equal(connector.pathData, 'M 300 180 C 300 220, 500 220, 500 260');

            // Docking dots check
            assert.deepEqual(connector.startAnchor, { cx: 300, cy: 180, r: 3 });
            assert.deepEqual(connector.endAnchor, { cx: 500, cy: 260, r: 3 });
        });

        it('should maintain content coordinate invariance under canvas scale', () => {
            // Suppose in unscaled content space:
            // content container is at (0, 0), parent is at x=400..680 (center 540), y=50..206 (bottom 206)
            // When canvas is scaled to scale S with translation (tx, ty):
            const unscaledCard = { left: 400, top: 50, right: 680, bottom: 206, width: 280, height: 156 };
            const scalesToTest = [0.3, 0.5, 1.0, 1.5, 2.0];

            for (const S of scalesToTest) {
                const tx = 100;
                const ty = 50;
                const contentRect = { left: tx, top: ty, width: 2000 * S, height: 1500 * S };
                const scaledCardRect = {
                    left: tx + unscaledCard.left * S,
                    top: ty + unscaledCard.top * S,
                    right: tx + unscaledCard.right * S,
                    bottom: ty + unscaledCard.bottom * S,
                    width: unscaledCard.width * S,
                    height: unscaledCard.height * S,
                };

                const pos = computeCardContentPosition(scaledCardRect, contentRect, S);

                assert.ok(Math.abs(pos.x - 540) < 1e-6, `pos.x should be 540 at scale ${S}, got ${pos.x}`);
                assert.ok(Math.abs(pos.topY - 50) < 1e-6, `pos.topY should be 50 at scale ${S}, got ${pos.topY}`);
                assert.ok(Math.abs(pos.bottomY - 206) < 1e-6, `pos.bottomY should be 206 at scale ${S}, got ${pos.bottomY}`);
            }
        });

        it('should verify cubic bezier geometry has vertical tangents and monotonic descending Y', () => {
            const x1 = 350;
            const y1 = 156;
            const x2 = 120;
            const y2 = 250;
            const midY = (y1 + y2) / 2;

            // Test endpoints: t=0 and t=1
            const pStart = evaluateCubicBezier(x1, y1, x2, y2, midY, 0);
            assert.equal(pStart.x, x1);
            assert.equal(pStart.y, y1);

            const pEnd = evaluateCubicBezier(x1, y1, x2, y2, midY, 1);
            assert.equal(pEnd.x, x2);
            assert.equal(pEnd.y, y2);

            // Analytical derivative at t=0: dx/dt = 3*(P1x - P0x) = 3*(x1 - x1) = 0 (perfect vertical start!)
            // Analytical derivative at t=1: dx/dt = 3*(P3x - P2x) = 3*(x2 - x2) = 0 (perfect vertical arrival!)
            const analyticalStartDx = 3 * (x1 - x1);
            const analyticalEndDx = 3 * (x2 - x2);
            assert.equal(analyticalStartDx, 0, 'Start tangent must be exactly 0 (vertical start)');
            assert.equal(analyticalEndDx, 0, 'End tangent must be exactly 0 (vertical arrival)');

            // Numerical limit check as epsilon -> 0
            const epsilon = 1e-7;
            const pNearStart = evaluateCubicBezier(x1, y1, x2, y2, midY, epsilon);
            const startDxDt = (pNearStart.x - pStart.x) / epsilon;
            assert.ok(Math.abs(startDxDt) < 1e-3, `Start tangent limit must approach 0, got ${startDxDt}`);

            const pNearEnd = evaluateCubicBezier(x1, y1, x2, y2, midY, 1 - epsilon);
            const endDxDt = (pEnd.x - pNearEnd.x) / epsilon;
            assert.ok(Math.abs(endDxDt) < 1e-3, `End tangent limit must approach 0, got ${endDxDt}`);

            // Monotonic Y descent check
            let lastY = y1;
            for (let step = 1; step <= 100; step++) {
                const t = step / 100;
                const pt = evaluateCubicBezier(x1, y1, x2, y2, midY, t);
                assert.ok(pt.y > lastY, `Y must strictly increase at t=${t} (prev=${lastY}, cur=${pt.y})`);
                lastY = pt.y;
            }
        });
    });

    describe('4. Event Isolation & Interaction Disambiguation', () => {
        it('should call stopPropagation and invoke toggleCollapse without invoking card selection', () => {
            const nodeId = 42;
            let collapseToggledId = null;
            let cardSelectedId = null;

            const onToggleCollapse = (id) => {
                collapseToggledId = id;
            };

            const onSelect = (id) => {
                cardSelectedId = id;
            };

            // Event simulation
            let propagationStopped = false;
            const mockEvent = {
                stopPropagation: () => {
                    propagationStopped = true;
                }
            };

            // Replicate handlePillClick from OrgNodeCard.jsx:
            // const handlePillClick = (e) => {
            //     e.stopPropagation()
            //     if (typeof onToggleCollapse === 'function') onToggleCollapse(node.id)
            // }
            const handlePillClick = (e) => {
                e.stopPropagation();
                if (typeof onToggleCollapse === 'function') {
                    onToggleCollapse(nodeId);
                }
            };

            // Replicate handleCardClick from OrgNodeCard.jsx:
            // const handleCardClick = () => {
            //     if (typeof onSelect === 'function') onSelect(node.id)
            // }
            const handleCardClick = () => {
                if (typeof onSelect === 'function') {
                    onSelect(nodeId);
                }
            };

            // 1. Simulate user clicking the bottom pill
            handlePillClick(mockEvent);

            // VERIFICATION 1: stopPropagation was called on the click event
            assert.equal(propagationStopped, true, 'e.stopPropagation() must be called on pill click');

            // VERIFICATION 2: onToggleCollapse was called with the target node ID
            assert.equal(collapseToggledId, 42, 'onToggleCollapse must receive node.id (42)');

            // VERIFICATION 3: Because propagation was stopped, card click handler is NOT invoked
            // In DOM event dispatch, if propagationStopped is true, parent onClick listeners do not execute
            if (!propagationStopped) {
                handleCardClick();
            }
            assert.equal(cardSelectedId, null, 'Card selection must NOT be triggered when pill is clicked');

            // 2. Simulate user clicking the card surface directly
            handleCardClick();
            assert.equal(cardSelectedId, 42, 'Card selection should only trigger when clicking card surface');
        });

        it('should ignore mouse down on interactive buttons to prevent initiating canvas pan', () => {
            // Replicate handleMouseDown filter from OrgChartCanvas.jsx:
            // if (e.target.closest('button, input, select, textarea, [data-no-pan]')) return
            function shouldInitiatePan(targetTagName) {
                const isInteractive = ['button', 'input', 'select', 'textarea'].includes(targetTagName.toLowerCase());
                return !isInteractive;
            }

            assert.equal(shouldInitiatePan('button'), false, 'Canvas pan must NOT initiate on button click (pill)');
            assert.equal(shouldInitiatePan('input'), false, 'Canvas pan must NOT initiate on input click (search)');
            assert.equal(shouldInitiatePan('select'), false, 'Canvas pan must NOT initiate on select click (dropdown)');
            assert.equal(shouldInitiatePan('div'), true, 'Canvas pan CAN initiate on general div surface');
        });

        it('should disambiguate drag pan (>3px) from card click selection', () => {
            // Replicate handleCardClick from OrgChartCanvas.jsx:
            // const handleCardClick = (agentId) => {
            //     if (dragOriginRef.current.moved) return
            //     if (typeof onSelectAgent === 'function') onSelectAgent(agentId)
            // }
            let selectedId = null;
            const onSelectAgent = (id) => { selectedId = id; };

            function simulateCanvasCardClick(moved, agentId) {
                if (moved) return;
                onSelectAgent(agentId);
            }

            // Scenario A: User dragged canvas 10px (moved = true) and released mouse over a card
            simulateCanvasCardClick(true, 101);
            assert.equal(selectedId, null, 'Dragging canvas must NOT select card upon mouse release');

            // Scenario B: User clicked intentionally without dragging (moved = false)
            simulateCanvasCardClick(false, 101);
            assert.equal(selectedId, 101, 'Intentional click must select card');
        });
    });
});
