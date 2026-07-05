import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { ListRow } from '../../../components/ui';
import { palette } from '../../../theme/tokens';
import type { FoodItem } from '../types';

type Props = {
  food: FoodItem;
  /** Show a heart (Recent/Favorites) instead of the kcal + chevron. */
  heart?: boolean;
};

export function FoodRow({ food, heart = false }: Props) {
  return (
    <ListRow
      icon="fast-food-outline"
      title={food.name}
      subtitle={food.brand ? `${food.brand} · ${food.kcal} kcal` : `${food.kcal} kcal`}
      value={heart ? undefined : `${food.kcal} kcal`}
      chevron={!heart}
      onPress={() => router.push(`/fuel/food/${food.id}`)}
      trailing={
        heart ? (
          <Pressable hitSlop={8}>
            <Ionicons
              name={food.favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={food.favorite ? palette.primary : palette.textTertiary}
            />
          </Pressable>
        ) : undefined
      }
    />
  );
}
