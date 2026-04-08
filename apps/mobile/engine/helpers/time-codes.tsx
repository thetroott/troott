import React from 'react';
import { Text, TextProps } from 'react-native';
import { convertRunTimeTicksToSeconds } from '@/engine/utils/runtimeticks';

type Alignment = 'center' | 'left' | 'right';

export function RunTimeSeconds({
  children,
  color = 'white',
  alignment = 'center',
  className,
}: {
  children: number;
  color?: string;
  alignment?: Alignment;
  className?: string;
}): React.ReactElement {
  return (
    <Text
      className={`font-bold tabular-nums ${className || ''}`}
      style={{ color, textAlign: alignment }}
    >
      {calculateRunTimeFromSeconds(children)}
    </Text>
  );
}

export function RunTimeTicks({
  children,
  className,
}: {
  children?: number | null;
  className?: string;
}): React.ReactElement {
  if (!children) return <Text className={className}>0:00</Text>;

  const time = calculateRunTimeFromTicks(children);

  return (
    <Text className={`tabular-nums text-gray-400 ${className || ''}`}>
      {time}
    </Text>
  );
}

// Helpers
function calculateRunTimeFromSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return (
    (hours !== 0 ? `${pad(hours)}:` : '') +
    (hours !== 0 ? `${pad(minutes)}:` : `${minutes}:`) +
    pad(secs)
  );
}

function calculateRunTimeFromTicks(ticks: number): string {
  const seconds = convertRunTimeTicksToSeconds(ticks);
  return calculateRunTimeFromSeconds(seconds);
}

function pad(num: number) {
  return num >= 10 ? `${num}` : `0${num}`;
}
