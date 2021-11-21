import chalk from "chalk";
import fs from "fs";
import { JsonInput } from "../../../types";
import { api } from "../../api";
import { toDateString } from "../../toDateString";
import { EventKind } from "../fetchNbaFeeds";
import { getTeamFromNbaAbbreviation } from "../nbaAbbreviationMap";

export async function getNbaEvents(date: string): Promise<EventKind[]> {
  const strippedDate = date.replaceAll("-", "");

  // Parse NBA response and build EventKind array
  const nbaApi = `https://data.nba.net/prod/v2/${strippedDate}/scoreboard.json`;
  const nbaResponse: any = await api(nbaApi);
  const nbaResponseEvents: any[] = nbaResponse.games;
  const nbaEvents: EventKind[] = nbaResponseEvents.map((e) => {
    return {
      Endpoint: "nba",
      EndpointId: e.gameId,
      HomeTeam: getTeamFromNbaAbbreviation(e.hTeam.triCode),
      AwayTeam: getTeamFromNbaAbbreviation(e.vTeam.triCode),
      EventDate: new Date(e.startTimeUTC),
    };
  });
  if (nbaEvents && nbaEvents.length > 0) {
    if (!fs.existsSync(`./feeds/nba/${date}`)) {
      fs.mkdirSync(`./feeds/nba/${date}`);
    }
    if (!fs.existsSync(`./feeds/nba/${date}/raw`)) {
      fs.mkdirSync(`./feeds/nba/${date}/raw`);
    }
    fs.writeFileSync(
      `./feeds/nba/${date}/raw/nba.json`,
      JSON.stringify(nbaResponseEvents, null, 2)
    );
    fs.writeFileSync(
      `./feeds/nba/${date}/nba.json`,
      JSON.stringify(nbaEvents, null, 2)
    );
  } else {
    console.error(chalk.red(`failed to get nba events on ${date}`));
  }
  return nbaEvents;
}

export const getNbaEventUrl = (feed: JsonInput): string => {
  if (!feed.date || !feed.nbaId) return "";
  const date = new Date(feed.date);
  const dateStr = toDateString(date).replaceAll("-", "");
  return `http://data.nba.net/prod/v1/${dateStr}/${feed.nbaId}_boxscore.json`;
};
