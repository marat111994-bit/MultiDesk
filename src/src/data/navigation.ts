import type { NavigationItem } from "@/types";

export const navigation: NavigationItem[] = [
  {
    label: "Услуги",
    href: "/uslugi/",
    children: [
      {
        label: "Вывоз грунта",
        href: "/uslugi/vyvoz-grunta/",
        children: [
          {
            label: "Вывоз грунта самосвалами",
            href: "/uslugi/vyvoz-grunta/samosvalami/",
          },
          {
            label: "Вывоз грунта в контейнерах",
            href: "/uslugi/vyvoz-grunta/konteinerami/",
          },
          {
            label: "Вывоз плодородного слоя почвы",
            href: "/uslugi/vyvoz-grunta/plodorodnyj-sloj/",
          },
          {
            label: "Вывоз песка и грунта",
            href: "/uslugi/vyvoz-grunta/pesok-i-grunt/",
          },
          {
            label: "Утилизация грунта",
            href: "/uslugi/vyvoz-grunta/utilizaciya/",
          },
        ],
      },
      {
        label: "Кирпичный бой",
        href: "/uslugi/kirpichnyj-boj/",
        children: [
          {
            label: "Вывоз кирпичного боя",
            href: "/uslugi/kirpichnyj-boj/vyvoz/",
          },
          {
            label: "Утилизация кирпичного боя",
            href: "/uslugi/kirpichnyj-boj/utilizaciya/",
          },
        ],
      },
      {
        label: "Бетонный бой",
        href: "/uslugi/betonnyj-boj/",
        children: [
          {
            label: "Вывоз бетонного боя",
            href: "/uslugi/betonnyj-boj/vyvoz/",
          },
          {
            label: "Утилизация бетонного боя",
            href: "/uslugi/betonnyj-boj/utilizaciya/",
          },
          {
            label: "Дробление бетона",
            href: "/uslugi/betonnyj-boj/droblenie/",
          },
          {
            label: "Резка алмазная",
            href: "/uslugi/betonnyj-boj/alkmaznaya-rezka/",
          },
        ],
      },
      {
        label: "Асфальтовый бой",
        href: "/uslugi/asfaltnyj-boj/",
      },
      {
        label: "Смешанные отходы",
        href: "/uslugi/smeshannye-stroitelnye-othody/",
      },
      {
        label: "Документация",
        href: "/uslugi/razreshitelnaya-dokumentaciya/",
        children: [
          {
            label: "Паспорт отходов",
            href: "/uslugi/razreshitelnaya-dokumentaciya/pasport-othodov/",
          },
          {
            label: "Лицензия",
            href: "/uslugi/razreshitelnaya-dokumentaciya/licenziya/",
          },
          {
            label: "Акты утилизации",
            href: "/uslugi/razreshitelnaya-dokumentaciya/akty-utilizacii/",
          },
        ],
      },
    ],
  },
  {
    label: "Калькулятор",
    href: "/calculator/",
  },
  {
    label: "Блог",
    href: "/blog/",
  },
  {
    label: "О нас",
    href: "/o-kompanii/",
  },
  {
    label: "Контакты",
    href: "/kontakty/",
  },
];
