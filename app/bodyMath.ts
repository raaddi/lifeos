export function clampBodyValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function bodyComposition(heightCm: number, weightKg: number, bodyFat: number) {
  const heightM = clampBodyValue(heightCm, 100, 230) / 100;
  const safeFat = clampBodyValue(bodyFat, 4, 50);
  const leanMass = clampBodyValue(weightKg, 30, 250) * (1 - safeFat / 100);
  const ffmi = leanMass / (heightM * heightM);
  const muscle = clampBodyValue((ffmi - 15) / 10, 0, 1);
  const fat = clampBodyValue((safeFat - 7) / 38, 0, 1);
  const bmi = clampBodyValue(weightKg, 30, 250) / (heightM * heightM);
  const mass = clampBodyValue((bmi - 17) / 23, 0, 1);
  return { heightM, leanMass, ffmi, muscle, fat, mass };
}
