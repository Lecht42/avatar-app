export const uk = {
  ui: {
    hero_title: "Візуальна студія для магістерської роботи",
    hero_body: "Створюйте аватари та векторні описи для дипломного дослідження — усе працює локально без бекенда.",
  },
  buttons: {
    analyse: "Проаналізувати",
    generate: "Згенерувати аватар диплома",
    clustering: "Запустити кластеризацію",
    embeddings: "Обчислити ембедінги",
  },
} as const;

export type UkDict = typeof uk;
