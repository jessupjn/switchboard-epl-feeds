/**
 * Hits each endpoint and builds a struct containing
 * Home Team, Away Team, Event Date, Endpoint Name, Endpoint ID
 * Then attempts to map each event to each endpoint using the NBA as the master record
 *
 * @privateRemarks probably need to use some kind of fuzzy matching to match teams unless we mapped each team ID
 */

import fs from "fs";
import chalk from "chalk";
import { JsonInput } from "../../types";
import { capitalizeTeamName } from "./nbaAbbreviationMap";
import { getNbaEvents } from "./jobs/nba";
import { getEspnEvents } from "./jobs/espn";
import { getYahooEvents } from "./jobs/yahoo";
import { toDateString } from "../toDateString";

export interface EventKind {
  Endpoint: string;
  EndpointId: string;
  HomeTeam: string;
  AwayTeam: string;
  EventDate: Date; // UTC
}

export interface Event {
  Nba: EventKind;
  Espn?: EventKind;
  Yahoo?: EventKind;
}

export async function fetchNbaFeeds(date: string): Promise<JsonInput[]> {
  const nbaEvents = await getNbaEvents(date);
  const espnEvents = await getEspnEvents(date);
  const yahooEvents = await getYahooEvents(date);
  if (!nbaEvents || nbaEvents.length === 0) return [];

  // match NBA to ESPN & Yahoo list
  const matches: Event[] = nbaEvents.map((nbaEvent) => {
    const m: Event = {
      Nba: nbaEvent,
    };
    // find ESPN event
    m.Espn = espnEvents.find(
      (espnEvent) =>
        espnEvent.HomeTeam === nbaEvent.HomeTeam &&
        espnEvent.AwayTeam === nbaEvent.AwayTeam
    );
    if (!m.Espn)
      console.log(
        chalk.red(
          `failed to match ESPN event for ${nbaEvent.AwayTeam} @ ${nbaEvent.HomeTeam}`
        )
      );
    m.Yahoo = yahooEvents.find(
      (yahooEvent) =>
        yahooEvent.HomeTeam === nbaEvent.HomeTeam &&
        yahooEvent.AwayTeam === nbaEvent.AwayTeam
    );
    if (!m.Yahoo)
      console.log(
        chalk.red(
          `failed to match Yahoo event for ${nbaEvent.AwayTeam} @ ${nbaEvent.HomeTeam}`
        )
      );
    return m;
  });
  if (!matches || matches.length === 0) {
    console.error(`failed to find any event matches on ${date}`);
  }

  fs.writeFileSync(
    `./feeds/nba/${date}/full_matches.json`,
    JSON.stringify(matches, null, 2)
  );
  const eventMatches: JsonInput[] = matches.map((match) => {
    const name = `${capitalizeTeamName(
      match.Nba.AwayTeam
    )}_at_${capitalizeTeamName(match.Nba.HomeTeam)}_${toDateString(
      match.Nba.EventDate
    )}`;
    const jsonInput: JsonInput = {
      name: name,
      date: match.Nba.EventDate,
      nbaId: match.Nba.EndpointId,
      yahooId: match.Yahoo?.EndpointId,
      espnId: match.Espn?.EndpointId,
    };
    return jsonInput;
  });
  fs.writeFileSync(
    `./feeds/nba/${date}/${date}_JsonInput.json`,
    JSON.stringify(eventMatches, null, 2)
  );
  const matchCount: string = eventMatches.length.toString().padStart(2, " ");
  const nbaCount = eventMatches
    .filter((m) => m.nbaId)
    .length.toString()
    .padStart(2, " ");
  const espnCount = eventMatches
    .filter((m) => m.espnId)
    .length.toString()
    .padStart(2, " ");
  const yahooCount = eventMatches
    .filter((m) => m.yahooId)
    .length.toString()
    .padStart(2, " ");

  console.log(
    `${chalk.blue(date)}: ${chalk.yellow(matchCount)} events  [${chalk.yellow(
      nbaCount
    )} NBA / ${chalk.yellow(espnCount)} ESPN / ${chalk.yellow(
      yahooCount
    )} Yahoo ]`
  );
  return eventMatches;
}

// export async function main(): Promise<void> {
//   const answer = await prompts([
//     {
//       type: "number",
//       name: "numDays",
//       message: "How many days do you want to fetch data for? (1-200)",
//     },
//   ]);
//   const dates = await selectDates(answer.numDays);
//   let allMatches: JsonInput[] = [];
//   for await (const d of dates) {
//     const matches: JsonInput[] = await fetchNbaFeeds(d);
//     if (!matches) console.error(`failed to fetch feeds for ${d}`);
//     allMatches = allMatches.concat(matches);
//   }
//   if (allMatches) {
//     fs.writeFileSync(
//       `./feeds/nba/JsonInput.json`,
//       JSON.stringify(allMatches, null, 2)
//     );
//     const header =
//       "Date,Name,NBA ID,ESPN ID,Yahoo ID,NBA Endpoint,SPN Endpoint,Yahoo Endpoint,";
//     const csvLines: string[] = allMatches.map(
//       (m) =>
//         `"${toDateString(m.date)}","${m.name}","${m.nbaId}","${m.espnId}","${
//           m.yahooId
//         }","${getNbaEventUrl(m)}","${getEspnEventUrl(m)}","${getYahooEventUrl(
//           m
//         )}"`
//     );
//     csvLines.unshift(header);
//     fs.writeFileSync(`./feeds/nba/AllFeeds.csv`, csvLines.join("\r\n"));
//   }
// }

// main().then(
//   () => {
//     console.log(chalk.green("Succesfully fetched NBA Feeds"));
//     process.exit();
//   },
//   (err) => {
//     console.error(err);
//   }
// );
