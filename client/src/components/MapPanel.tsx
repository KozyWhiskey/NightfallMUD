// client/src/components/MapPanel.tsx
import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useGameStore } from '../stores/useGameStore';
import type { Room } from '../types';

const MIN_GRID_SIZE = 7;
const MAX_GRID_SIZE = 11;
const CELL_SIZE = 30; // smaller room cells
const CELL_GAP = 8; // smaller gaps

export function MapPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState(MIN_GRID_SIZE);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const currentRoom = useGameStore(state => state.room);
  const allRoomsInZone = useGameStore(state => state.zoneRooms);
  const sendCommand = useGameStore(state => state.sendCommand);
  const inCombat = useGameStore(state => state.inCombat);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (panelRef.current) {
        const { width, height } = panelRef.current.getBoundingClientRect();
        const newGridWidth = Math.floor(width / (CELL_SIZE + CELL_GAP));
        const newGridHeight = Math.floor(height / (CELL_SIZE + CELL_GAP));
        const newGridSize = Math.max(
          MIN_GRID_SIZE,
          Math.min(MAX_GRID_SIZE, newGridWidth, newGridHeight),
        );
        setGridSize(newGridSize);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (panelRef.current) {
      resizeObserver.observe(panelRef.current);
    }

    handleResize();

    return () => {
      if (panelRef.current) {
        resizeObserver.unobserve(panelRef.current);
      }
    };
  }, []);

  const visibleRooms = useMemo(() => {
    if (!currentRoom || !allRoomsInZone.length) return [];

    const halfGrid = Math.floor(gridSize / 2);
    const startX = currentRoom.x - halfGrid;
    const startY = currentRoom.y - halfGrid;
    const endX = startX + gridSize - 1;
    const endY = startY + gridSize - 1;

    const filteredRooms = allRoomsInZone.filter(
      room =>
        room.x >= startX &&
        room.x <= endX &&
        room.y >= startY &&
        room.y <= endY &&
        room.z === currentRoom.z,
    );
    return filteredRooms;
  }, [currentRoom, allRoomsInZone, gridSize]);

  const roomPositions = useMemo(() => {
    if (!currentRoom) return new Map();
    const halfGrid = Math.floor(gridSize / 2);
    // Center the current room in the SVG viewBox
    const svgWidth = gridSize * (CELL_SIZE + CELL_GAP);
    const svgHeight = gridSize * (CELL_SIZE + CELL_GAP);
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;

    const positions = new Map<string, { x: number; y: number }>();
    visibleRooms.forEach(room => {
      positions.set(room.id, {
        x: centerX + (room.x - currentRoom.x) * (CELL_SIZE + CELL_GAP),
        // Invert Y axis for north/south orientation
        y: centerY - (room.y - currentRoom.y) * (CELL_SIZE + CELL_GAP),
      });
    });
    return positions;
  }, [visibleRooms, currentRoom, gridSize]);

  const lines = useMemo(() => {
    const drawnLines = new Set<string>();
    const calculatedLines = visibleRooms
      .flatMap(room => {
        const roomPos = roomPositions.get(room.id);
        if (!roomPos) return [];

        return Object.values(room.exits).map(exitId => {
          const neighbor = allRoomsInZone.find(r => r.id === exitId);
          if (!neighbor) return null;

          const neighborPos = roomPositions.get(neighbor.id);
          if (!neighborPos) return null;

          const lineKey = [room.id, neighbor.id].sort().join('-');
          if (drawnLines.has(lineKey)) return null;
          drawnLines.add(lineKey);

          return {
            key: lineKey,
            x1: roomPos.x,
            y1: roomPos.y,
            x2: neighborPos.x,
            y2: neighborPos.y,
          };
        });
      })
      .filter(line => line !== null);
    return calculatedLines;
  }, [visibleRooms, roomPositions, allRoomsInZone]);

  const getAdjacentDirection = (targetRoom: Room): string | null => {
    if (!currentRoom) return null;
    
    const exits = currentRoom.exits as { [key: string]: string };
    for (const [direction, roomId] of Object.entries(exits)) {
      if (roomId === targetRoom.id) {
        return direction;
      }
    }
    return null;
  };

  const handleRoomClick = (room: Room) => {
    const direction = getAdjacentDirection(room);
    if (direction) {
      sendCommand({ action: 'move', payload: direction });
    }
  };

  const handleMouseEnter = (room: Room, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      text: room.name,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  if (!currentRoom) {
    return (
      <Box
        ref={panelRef}
        p="20px"
        bg="gray.800"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.700"
        h="30vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.400" fontSize="1.1em">Loading map...</Text>
      </Box>
    );
  }

  return (
    <Box
      ref={panelRef}
      p="20px"
      bg="transparent"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.700"
      boxShadow="0 0 32px 8px #111112"
      h="30vh"
      display="flex"
      flexDirection="column"
    >
      <Box flex="1" position="relative" overflow="hidden">
        <svg 
          viewBox={`0 0 ${gridSize * (CELL_SIZE + CELL_GAP)} ${gridSize * (CELL_SIZE + CELL_GAP)}`}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            background: 'radial-gradient(ellipse at center, #18181b 60%, #111112 100%)',
            filter: 'drop-shadow(0 2px 12px #111112cc)',
          }}
        >
          <defs>
            {/* Pulse animation for current room */}
            <radialGradient id="currentRoomGlow" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#b6e0fe" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#b6e0fe" stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="combatGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {/* Vignette mask for edge fade */}
            <radialGradient id="vignette" cx="50%" cy="50%" r="80%">
              <stop offset="80%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
            </radialGradient>
          </defs>
          {/* Vignette overlay for edge fade */}
          <rect
            x="0" y="0"
            width={gridSize * (CELL_SIZE + CELL_GAP)}
            height={gridSize * (CELL_SIZE + CELL_GAP)}
            fill="url(#vignette)"
            pointerEvents="none"
          />
          {/* Connection lines */}
          {lines.map(line => (
            <line 
              key={line.key}
              x1={line.x1} 
              y1={line.y1} 
              x2={line.x2} 
              y2={line.y2} 
              stroke="#4b5563" // blue-gray, low opacity
              strokeWidth="2.2"
              opacity="0.32"
            />
          ))}
          {/* Room nodes */}
          {visibleRooms.map(room => {
            const pos = roomPositions.get(room.id);
            if (!pos) return null;
            const isAdjacent = getAdjacentDirection(room) !== null;
            const isCurrentRoom = room.id === currentRoom.id;
            const hasUp = !!room.exits['up'];
            const hasDown = !!room.exits['down'];
            // Node style
            let fillColor = "#23232a"; // deep gray
            let strokeColor = "#444";
            let strokeWidth = 2;
            let filter = '';
            let cursor = 'default';
            let animatePulse = false;
            if (isCurrentRoom && inCombat) {
              fillColor = "#7f1d1d"; // deep red
              strokeColor = "#b91c1c";
              strokeWidth = 4;
              filter = 'url(#combatGlow)';
              animatePulse = true;
            } else if (isCurrentRoom) {
              fillColor = "#b6e0fe"; // pale blue
              strokeColor = "#e0e0e0";
              strokeWidth = 4;
              filter = 'url(#glow)';
              animatePulse = true;
            } else if (isAdjacent) {
              fillColor = "#3a4a4a"; // gloom
              strokeColor = "#666";
              strokeWidth = 3;
              cursor = 'pointer';
            }
            return (
              <g key={room.id}>
                {/* Pulse animation for current room */}
                {animatePulse && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={CELL_SIZE / 2 + 7}
                    fill="url(#currentRoomGlow)"
                  >
                    <animate
                      attributeName="r"
                      values={`${CELL_SIZE / 2 + 7};${CELL_SIZE / 2 + 13};${CELL_SIZE / 2 + 7}`}
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.18;0.08;0.18"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={CELL_SIZE / 2}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  style={{ cursor, transition: 'fill 0.2s, stroke 0.2s' }}
                  filter={filter}
                  onClick={() => handleRoomClick(room)}
                  onMouseEnter={(e) => handleMouseEnter(room, e)}
                  onMouseLeave={handleMouseLeave}
                />
                {/* Up/Down indicators */}
                {hasUp && (
                  <text
                    x={pos.x}
                    y={pos.y - 2}
                    fill="#3b82f6" // dimmed blue
                    fontSize="12"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    opacity="0.5"
                  >▲</text>
                )}
                {hasDown && (
                  <text
                    x={pos.x}
                    y={pos.y + 8}
                    fill="#3b82f6"
                    fontSize="12"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    opacity="0.5"
                  >▼</text>
                )}
              </g>
            );
          })}
          {/* Fog of war: intrusive edge mist */}
          <g style={{ pointerEvents: 'none' }}>
            <defs>
              <radialGradient id="fogOfWar" cx="50%" cy="50%" r="80%">
                <stop offset="60%" stopColor="#000" stopOpacity="0" />
                <stop offset="80%" stopColor="#3a4a4a" stopOpacity="0.18" />
                <stop offset="95%" stopColor="#18181b" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#111112" stopOpacity="0.65" />
              </radialGradient>
              <filter id="fogBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="16" />
              </filter>
            </defs>
            <ellipse
              cx="50%"
              cy="50%"
              rx={gridSize * (CELL_SIZE + CELL_GAP) * 0.48}
              ry={gridSize * (CELL_SIZE + CELL_GAP) * 0.48}
              fill="url(#fogOfWar)"
              filter="url(#fogBlur)"
            />
          </g>
        </svg>
        {/* Tooltip */}
        {tooltip && (
          <Box
            position="fixed"
            left={tooltip.x}
            top={tooltip.y}
            bg="gray.900"
            color="gray.100"
            px="3"
            py="2"
            borderRadius="md"
            fontSize="0.9em"
            zIndex={2000}
            pointerEvents="none"
            boxShadow="md"
          >
            {tooltip.text}
          </Box>
        )}
      </Box>
    </Box>
  );
}