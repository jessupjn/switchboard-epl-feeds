import { Account, PublicKey, Cluster } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/switchboard-api";
import { DataFeedFactory } from "./";

// should keep track of configuration parameters that might change flow of program
// log this on error
export interface AppConfig {
  cluster: Cluster;
  fulfillmentManager: PublicKey;
  sport: string;
  factoryInput: FactoryInput[];
  factory: DataFeedFactory;
}

/**
 * @param name  Unique name for the data feed
 * @param espnId (optional) The ESPN ID associated with the data feed
 * @param yahooId  (optional) The Yahoo ID associated with the data feed
 */
export interface JsonInput {
  name: string;
  espnId?: string;
  yahooId?: string;
}

export interface FactoryInput {
  name: string;
  sport: string;
  jobs: JobInput[];
}
export interface FactoryOutput {
  dataFeed: Account;
  jobs: JobOutput[];
}
export interface FactoryOutputJSON {
  name: string;
  dataFeed: string;
  jobs: JobOutputJSON[];
}

export interface JobOutput {
  jobProvider: string;
  jobId: string;
  job: OracleJob;
  pubKey?: PublicKey;
}
export interface JobInput {
  jobProvider: string;
  jobId: string;
}
export interface JobOutputJSON {
  provider: string;
  id: string;
  pubKey: string;
}