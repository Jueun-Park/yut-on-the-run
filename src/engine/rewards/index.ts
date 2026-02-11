/**
 * Reward System Module
 *
 * Manages artifact rewards when pieces finish:
 * - Calculate reward candidates based on stack size
 *   - k=1 piece → 3 choices
 *   - k=2 pieces → 2 choices
 *   - k=3 pieces → 1 choice
 *   - k=4 pieces → 1 choice
 * - Generate artifact options (content TBD)
 * - Apply selected artifact
 */

export interface Artifact {
  id: string;
  name: string;
  description: string;
}

/**
 * Calculate number of artifact choices based on finishing stack size
 * Uses "stacking demerit" rule: max(1, 4 - k)
 */
export function calculateRewardChoices(stackSize: number): number {
  return Math.max(1, 4 - stackSize);
}

/**
 * Placeholder artifact pool for MVP
 * In the future, this would be a proper content system with many artifacts
 */
const ARTIFACT_POOL: Artifact[] = [
  {
    id: 'artifact-1',
    name: '행운의 윷가락',
    description: '다음 던지기에서 윷이나 모가 나올 확률이 증가합니다.',
  },
  {
    id: 'artifact-2',
    name: '빠른 발걸음',
    description: '모든 이동에 +1 보너스를 받습니다.',
  },
  {
    id: 'artifact-3',
    name: '신중한 선택',
    description: '분기점에서 선택을 취소하고 다시 선택할 수 있습니다.',
  },
  {
    id: 'artifact-4',
    name: '중앙의 축복',
    description: '중앙(C)에 도착하면 추가로 한 번 더 던질 수 있습니다.',
  },
  {
    id: 'artifact-5',
    name: '완주의 기쁨',
    description: '말이 완주할 때마다 체력이 회복됩니다.',
  },
  {
    id: 'artifact-6',
    name: '대각선의 달인',
    description: '대각선 경로에서 이동 시 보너스를 받습니다.',
  },
  {
    id: 'artifact-7',
    name: '집결의 힘',
    description: '업힌 말의 수에 비례하여 특수 효과가 발동합니다.',
  },
  {
    id: 'artifact-8',
    name: '재도전의 기회',
    description: '턴당 한 번, 던지기 결과를 다시 던질 수 있습니다.',
  },
  {
    id: 'artifact-9',
    name: '전략가의 혜안',
    description: '다음 3번의 던지기 결과를 미리 볼 수 있습니다.',
  },
  {
    id: 'artifact-10',
    name: '마지막 질주',
    description: 'O15 이후 구간에서 이동 속도가 2배가 됩니다.',
  },
];

/**
 * Generate random artifact candidates
 * For MVP, we just pick random artifacts from the pool
 * @param count Number of artifacts to generate
 * @param rng Random number generator function (defaults to Math.random)
 */
export function generateArtifactCandidates(
  count: number,
  rng: () => number = Math.random
): Artifact[] {
  if (count <= 0) return [];
  if (count > ARTIFACT_POOL.length) {
    count = ARTIFACT_POOL.length;
  }

  // Shuffle using Fisher-Yates with provided RNG
  const shuffled = [...ARTIFACT_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
}
