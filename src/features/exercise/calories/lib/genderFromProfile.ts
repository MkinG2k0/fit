/** true — мужская ветка формулы Keytel; false — женская. */
export const isMaleFromGender = (gender: string | undefined): boolean => {
  if (!gender) {
    return true;
  }
  const g = gender.trim().toLowerCase();
  if (
    g === "male" ||
    g === "m" ||
    g === "муж" ||
    g === "мужской" ||
    g === "man"
  ) {
    return true;
  }
  if (
    g === "female" ||
    g === "f" ||
    g === "жен" ||
    g === "женский" ||
    g === "woman"
  ) {
    return false;
  }
  return true;
};
