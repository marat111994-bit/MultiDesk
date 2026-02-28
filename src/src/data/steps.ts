import type { Step } from "@/types";

export const steps: Step[] = [
  {
    number: 1,
    title: "Заявка",
    description: "Оставьте заявку на сайте, в Telegram или по телефону. Ответим за 15 минут",
    icon: "phone",
  },
  {
    number: 2,
    title: "Расчёт",
    description: "Рассчитаем стоимость с учётом объёма, типа отходов и расстояния. Бесплатно",
    icon: "calculator",
  },
  {
    number: 3,
    title: "Договор",
    description: "Подпишем договор с фиксированной ценой. Без скрытых доплат",
    icon: "file-signature",
  },
  {
    number: 4,
    title: "Вывоз",
    description: "Подаём технику в согласованное время. Вывозим и утилизируем на лицензированном полигоне",
    icon: "truck",
  },
  {
    number: 5,
    title: "Документы",
    description: "Передаём акты утилизации, талоны и закрывающие документы в течение 5 рабочих дней",
    icon: "file-text",
  },
];
