import prompts, { Choice } from "prompts";
import chalk from "chalk";

function getNextNDays(numDays: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 0; i < numDays; i++) {
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + i);
    days.push(getDateString(nextDate));
  }
  // console.log(
  //   `${chalk.blue(days[0])} ${chalk.yellow("-")} ${chalk.blue(days[-1])}`
  // );
  return days;
}

export async function getDates(numDays: number): Promise<string[]> {
  const days = getNextNDays(numDays);
  const choices: Choice[] = days.map((d) => {
    return { title: d, value: d };
  });
  const answer = await prompts([
    {
      type: "multiselect",
      name: "date",
      message: "Pick a date to fetch events for",
      choices,
    },
  ]);
  console.log(
    `${chalk.blue(answer.date[0])} ${chalk.yellow("-")} ${chalk.blue(
      answer.date[answer.date.length - 1]
    )}`
  );
  // console.log(answer.date);
  return answer.date;
}

export function getDateString(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}