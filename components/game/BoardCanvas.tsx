'use client';

import { useCallback } from 'react';
import { useBoardStore, type PointState, type PlayerColor } from '@/stores/boardStore';

// ─── Geometry constants ───────────────────────────────────────────────────────
const BOARD_W = 700;
const BOARD_H = 480;
const BAR_W   = 40;
const PAD     = 8;

const POINT_W     = (BOARD_W - BAR_W) / 12;           // 55px per triangle
const POINT_H     = BOARD_H * 0.44;                    // 211.2px triangle height
const CHECKER_R   = POINT_W * 0.33;                    // 18.15px checker radius
const STACK_STEP  = (POINT_H - CHECKER_R * 2) / 4;     // 43.7px between checker centres

const BAR_CR   = BAR_W / 2 - 4;   // 16px — bar checker radius
const BAR_STEP = BAR_CR * 2 + 3;  // 35px — bar stack step
const BAR_GAP  = 34;              // reserved dead-zone around centre for dice

// ─── X coordinate for each point index ───────────────────────────────────────
function pointX(i: number): number {
  if (i <= 5)  return (BOARD_W - BAR_W / 2) - (i + 1)     * POINT_W + POINT_W / 2;
  if (i <= 11) return (BOARD_W / 2 - BAR_W / 2) - (i - 5) * POINT_W + POINT_W / 2;
  if (i <= 17) return PAD + (i - 12)                       * POINT_W + POINT_W / 2;
  return (BOARD_W / 2 + BAR_W / 2) + (i - 18)             * POINT_W + POINT_W / 2;
}

// Points 12-23 live in the LOWER SVG half (tips near BOARD_H - PAD).
// Points  0-11 live in the UPPER SVG half (tips near PAD).
function isLower(i: number) { return i >= 12; }

function tipBaseY(i: number) {
  const lower = isLower(i);
  const tipY  = lower ? BOARD_H - PAD : PAD;
  const baseY = lower ? BOARD_H - PAD - POINT_H : PAD + POINT_H;
  return { tipY, baseY, lower };
}

// Checker centres stack FROM THE EDGE (tipY) inward.
// Lower half → sign = -1 (grow upward).   Upper half → sign = +1 (grow downward).
function checkerCY(tipY: number, lower: boolean, ci: number): number {
  return tipY + (lower ? -1 : 1) * (CHECKER_R + ci * STACK_STEP);
}

// ─── Triangle polygon for one point ──────────────────────────────────────────
function Triangle({
  index, isSelected, isValidTarget,
}: {
  index: number; isSelected: boolean; isValidTarget: boolean;
}) {
  const x = pointX(index);
  const { tipY, baseY } = tipBaseY(index);
  const isEven = index % 2 === 0;

  const fill = isSelected
    ? '#1A56FF'
    : isValidTarget
    ? 'rgba(26,86,255,0.45)'
    : isEven
    ? '#7A2828'
    : '#1A3560';

  return (
    <polygon
      points={`${x - POINT_W / 2 + 2},${baseY} ${x + POINT_W / 2 - 2},${baseY} ${x},${tipY}`}
      fill={fill}
      opacity={0.88}
      filter={isSelected || isValidTarget ? 'url(#ptGlow)' : undefined}
    />
  );
}

// ─── Point index label ────────────────────────────────────────────────────────
function PointLabel({ index }: { index: number }) {
  const x = pointX(index);
  const lower = isLower(index);
  return (
    <text
      x={x}
      y={lower ? BOARD_H - 1 : PAD + 7}
      textAnchor="middle"
      fontSize="8"
      fill="#475569"
      fontFamily="JetBrains Mono, monospace"
    >
      {index + 1}
    </text>
  );
}

// ─── Valid-move target dot ────────────────────────────────────────────────────
function TargetDot({ index }: { index: number }) {
  const x = pointX(index);
  const { tipY, lower } = tipBaseY(index);
  const cy = tipY + (lower ? -1 : 1) * CHECKER_R * 1.6;
  return (
    <circle
      cx={x} cy={cy} r={7}
      fill="rgba(26,86,255,0.28)"
      stroke="#1A56FF"
      strokeWidth={1.5}
    />
  );
}

// ─── Stack of checkers for one point ─────────────────────────────────────────
function CheckerStack({ index, pointData }: { index: number; pointData: PointState }) {
  if (pointData.count === 0 || pointData.color === null) return null;

  const x = pointX(index);
  const { tipY, lower } = tipBaseY(index);
  const color = pointData.color;

  const fill   = color === 'white' ? '#E8EDF4' : '#0F1729';
  const stroke = color === 'white' ? '#1A56FF' : '#7C3AED';

  const visible = Math.min(pointData.count, 5);

  return (
    <>
      {Array.from({ length: visible }).map((_, ci) => {
        const cy = checkerCY(tipY, lower, ci);
        return (
          <circle
            key={ci}
            cx={x}
            cy={cy}
            r={CHECKER_R}
            fill={fill}
            stroke={stroke}
            strokeWidth={1.8}
          />
        );
      })}

      {/* Count badge when more than 5 checkers on one point */}
      {pointData.count > 5 && (
        <text
          x={x}
          y={checkerCY(tipY, lower, 4) + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill={color === 'white' ? '#0F172A' : '#E2E8F0'}
          fontFamily="JetBrains Mono, monospace"
        >
          {pointData.count}
        </text>
      )}
    </>
  );
}

// ─── Bar checker column ───────────────────────────────────────────────────────
function BarStack({ color, count, isSelected }: { color: PlayerColor; count: number; isSelected: boolean }) {
  if (count === 0) return null;

  const cx      = BOARD_W / 2;
  const sign    = color === 'white' ? 1 : -1;
  const startCY = BOARD_H / 2 + sign * (BAR_GAP + BAR_CR);
  const visible = Math.min(count, 4);

  const fill   = color === 'white' ? '#E8EDF4' : '#0F1729';
  const stroke = color === 'white' ? '#1A56FF' : '#7C3AED';

  return (
    <>
      {isSelected && (
        <rect
          x={cx - BAR_W / 2 + 2}
          y={startCY - BAR_CR - 3}
          width={BAR_W - 4}
          height={visible * BAR_STEP + 6}
          rx={4}
          fill="#1A56FF"
          opacity={0.2}
          transform={color === 'black' ? `translate(0, ${-(visible * BAR_STEP + 6) + BAR_CR * 2 + 6})` : undefined}
        />
      )}

      {Array.from({ length: visible }).map((_, i) => (
        <circle
          key={i}
          cx={cx}
          cy={startCY + sign * i * BAR_STEP}
          r={BAR_CR}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.8}
        />
      ))}

      {count > 4 && (
        <text
          x={cx}
          y={startCY + sign * 3 * BAR_STEP + 4}
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill={color === 'white' ? '#0F172A' : '#E2E8F0'}
          fontFamily="JetBrains Mono, monospace"
        >
          {count}
        </text>
      )}

      <text
        x={cx}
        y={color === 'white' ? BOARD_H / 2 + BAR_GAP - 10 : BOARD_H / 2 - BAR_GAP + 15}
        textAnchor="middle"
        fontSize="7"
        fill="#475569"
        letterSpacing="1"
        fontFamily="JetBrains Mono, monospace"
      >
        BAR
      </text>
    </>
  );
}

// ─── Dice display ─────────────────────────────────────────────────────────────
function DiceDisplay({
  dice, remainingDice, activeTurn,
}: {
  dice: number[]; remainingDice: number[]; activeTurn: PlayerColor | null;
}) {
  if (dice.length === 0) return null;

  const cx = BOARD_W / 2;
  const S  = 22;  // die square size

  // Mark each die as used or remaining (handles duplicate values correctly)
  const remCopy = [...remainingDice];
  const used = dice.map((val) => {
    const idx = remCopy.indexOf(val);
    if (idx !== -1) { remCopy.splice(idx, 1); return false; }
    return true;
  });

  const dieFill   = activeTurn === 'white' ? '#E8EDF4' : '#0F1729';
  const numFill   = activeTurn === 'white' ? '#0F172A' : '#E8EDF4';

  // Lay out dice vertically around board centre (inside the bar)
  const gap = S + 4;
  const offsets = dice.length === 4
    ? [-1.5 * gap, -0.5 * gap, 0.5 * gap, 1.5 * gap]
    : dice.length === 2
    ? [-S / 2 - 2, S / 2 + 2]
    : [0];

  return (
    <>
      {dice.map((val, i) => {
        const dy = BOARD_H / 2 + offsets[i] - S / 2;
        return (
          <g key={i} opacity={used[i] ? 0.28 : 1}>
            <rect
              x={cx - S / 2} y={dy}
              width={S} height={S}
              rx={5}
              fill={dieFill}
              stroke={used[i] ? '#334155' : '#1A56FF'}
              strokeWidth={1.5}
            />
            <text
              x={cx} y={dy + S / 2 + 5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fill={numFill}
              fontFamily="JetBrains Mono, monospace"
            >
              {val}
            </text>
          </g>
        );
      })}
    </>
  );
}

// ─── Main board component ─────────────────────────────────────────────────────
export default function BoardCanvas() {
  const {
    points, bar, selectedPoint, validMoves,
    activeTurn, dice, remainingDice,
    hasRolled, aiThinking,
    selectPoint, executeMove, resetSelection, rollDice,
  } = useBoardStore();

  const handlePointClick = useCallback(
    (index: number) => {
      if (activeTurn !== 'white') return;
      if (!hasRolled || remainingDice.length === 0) return;

      if (selectedPoint !== null && validMoves.includes(index)) {
        const from = selectedPoint;
        const dieValue = from === 24
          ? (index - (BOARD_H /* sentinel, unused */ * 0) + 1)   // bar entry: die = point+1 (1-based from white's side)
          : index - from;                                          // normal: die = distance
        // Recompute correctly: white moves +1, so dieValue = to - from
        const die = remainingDice.find((d) => d === Math.abs(index - (from === 24 ? -1 : from)));
        if (die !== undefined) executeMove(from, index, die);
      } else {
        selectPoint(index);
      }
    },
    [selectedPoint, validMoves, activeTurn, hasRolled, remainingDice, executeMove, selectPoint]
  );

  // Correct die value calculation for both normal moves and bar entries
  const getDie = useCallback((from: number, to: number): number | undefined => {
    const dist = from === 24
      ? to + 1          // white enters bar: die matches 1-based point number
      : to - from;      // normal white move (always positive since white moves +1)
    return remainingDice.find((d) => d === dist);
  }, [remainingDice]);

  const handleClick = useCallback(
    (index: number) => {
      if (activeTurn !== 'white') return;
      if (!hasRolled || remainingDice.length === 0) return;

      if (selectedPoint !== null && validMoves.includes(index)) {
        const die = getDie(selectedPoint, index);
        if (die !== undefined) executeMove(selectedPoint, index, die);
      } else {
        selectPoint(index);
      }
    },
    [selectedPoint, validMoves, activeTurn, hasRolled, getDie, executeMove, selectPoint]
  );

  const handleBarClick = useCallback(() => {
    if (activeTurn !== 'white' || !hasRolled || bar.white === 0) return;
    selectPoint(24);
  }, [activeTurn, hasRolled, bar.white, selectPoint]);

  const handleBgClick = useCallback(() => {
    if (selectedPoint !== null) resetSelection();
  }, [selectedPoint, resetSelection]);

  const showRoll   = activeTurn === 'white' && !hasRolled && !aiThinking;
  const showAiWait = activeTurn === 'black' || aiThinking;

  return (
    <div className="relative w-full max-w-[700px] mx-auto select-none">
      <svg
        viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
        width="100%"
        height="auto"
        className="rounded-xl overflow-hidden drop-shadow-2xl"
        onClick={handleBgClick}
      >
        <defs>
          <filter id="ptGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Layer 0: Board surfaces ─────────────────────────────────────── */}
        <rect width={BOARD_W} height={BOARD_H} fill="#1E2532" rx={12} />
        <rect
          x={PAD} y={PAD}
          width={BOARD_W / 2 - BAR_W / 2 - PAD} height={BOARD_H - PAD * 2}
          fill="#18202E" rx={6}
        />
        <rect
          x={BOARD_W / 2 + BAR_W / 2} y={PAD}
          width={BOARD_W / 2 - BAR_W / 2 - PAD} height={BOARD_H - PAD * 2}
          fill="#18202E" rx={6}
        />
        <rect
          x={BOARD_W / 2 - BAR_W / 2} y={PAD}
          width={BAR_W} height={BOARD_H - PAD * 2}
          fill="#151A23"
        />
        <line x1={PAD} y1={BOARD_H / 2} x2={BOARD_W / 2 - BAR_W / 2} y2={BOARD_H / 2}
          stroke="#2D3748" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={BOARD_W / 2 + BAR_W / 2} y1={BOARD_H / 2} x2={BOARD_W - PAD} y2={BOARD_H / 2}
          stroke="#2D3748" strokeWidth={1} strokeDasharray="4 4" />

        {/* ── Layer 1: All triangles (no checkers mixed in) ───────────────── */}
        <g>
          {points.map((_, i) => (
            <Triangle
              key={i}
              index={i}
              isSelected={selectedPoint === i}
              isValidTarget={validMoves.includes(i)}
            />
          ))}
        </g>

        {/* ── Layer 2: Point labels ───────────────────────────────────────── */}
        <g>
          {points.map((_, i) => <PointLabel key={i} index={i} />)}
        </g>

        {/* ── Layer 3: Valid-move dots (rendered ABOVE triangles) ─────────── */}
        <g>
          {validMoves.map((i) => <TargetDot key={i} index={i} />)}
        </g>

        {/* ── Layer 4: Checker stacks (one pass, on top of all triangles) ─── */}
        {/* Click targets are invisible rects over each point, not the checkers */}
        <g>
          {points.map((pt, i) => (
            <g
              key={i}
              onClick={(e) => { e.stopPropagation(); handleClick(i); }}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible hit area covering the whole triangle column */}
              <rect
                x={pointX(i) - POINT_W / 2}
                y={isLower(i) ? tipBaseY(i).baseY : PAD}
                width={POINT_W}
                height={POINT_H}
                fill="transparent"
              />
              <CheckerStack index={i} pointData={pt} />
            </g>
          ))}
        </g>

        {/* ── Layer 5: Bar checkers ───────────────────────────────────────── */}
        <g
          onClick={(e) => { e.stopPropagation(); handleBarClick(); }}
          style={{ cursor: bar.white > 0 ? 'pointer' : 'default' }}
        >
          <BarStack color="white" count={bar.white} isSelected={selectedPoint === 24} />
        </g>
        <g>
          <BarStack color="black" count={bar.black} isSelected={false} />
        </g>

        {/* ── Layer 6: Dice ───────────────────────────────────────────────── */}
        <DiceDisplay dice={dice} remainingDice={remainingDice} activeTurn={activeTurn} />

        {/* ── Layer 7: Roll / AI-wait / turn label ────────────────────────── */}
        {showRoll && (
          <g onClick={(e) => { e.stopPropagation(); rollDice(); }} style={{ cursor: 'pointer' }}>
            <rect
              x={BOARD_W / 2 - 52} y={BOARD_H / 2 - 16}
              width={104} height={32} rx={10}
              fill="#1A56FF" opacity={0.93}
            />
            <rect
              x={BOARD_W / 2 - 52} y={BOARD_H / 2 - 16}
              width={104} height={32} rx={10}
              fill="none" stroke="#4D7EFF" strokeWidth={1}
            />
            <text
              x={BOARD_W / 2} y={BOARD_H / 2 + 5}
              textAnchor="middle" fontSize="12" fontWeight="bold"
              fill="white" fontFamily="Inter, sans-serif" letterSpacing="0.8"
            >
              ROLL DICE
            </text>
          </g>
        )}

        {showAiWait && (
          <g>
            <rect
              x={BOARD_W / 2 - 48} y={BOARD_H / 2 - 13}
              width={96} height={26} rx={8}
              fill="#0F172A" opacity={0.93} stroke="#334155" strokeWidth={1}
            />
            <text
              x={BOARD_W / 2} y={BOARD_H / 2 + 4}
              textAnchor="middle" fontSize="10"
              fill="#94A3B8" fontFamily="JetBrains Mono, monospace"
            >
              AI thinking…
            </text>
          </g>
        )}

        {activeTurn && !showRoll && !showAiWait && (
          <text
            x={BOARD_W / 2} y={BOARD_H / 2 - 20}
            textAnchor="middle" fontSize="9" fill="#1A56FF"
            fontFamily="JetBrains Mono, monospace" letterSpacing="1.5"
          >
            {activeTurn.toUpperCase()} TO MOVE
          </text>
        )}
      </svg>
    </div>
  );
}
