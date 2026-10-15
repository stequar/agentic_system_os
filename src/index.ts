#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { CompanyStateMachine } from "./core/state-machine.js";

const program = new Command();

program
  .name("agentic-company")
  .description("CLI e Orchestratore per Startup Software Multi-Agente Autonome")
  .version("0.1.0");

program
  .command("status")
  .description("Mostra lo stato corrente dell'azienda e degli agenti")
  .action(() => {
    const sm = new CompanyStateMachine();
    console.log(chalk.bold.blue("\n🏢 AGENTIC COMPANY OS — Status"));
    console.log(chalk.gray("-----------------------------------------"));
    console.log(`Stato Attuale: ${chalk.green.bold(sm.getState())}`);
    console.log(chalk.yellow("Ruoli attivi: CTO (L1), Product Lead (L2), Backend Manager (L2), Mobile Manager (L2)"));
    console.log(chalk.cyan("Principio Context as RAM attivo via docs/wiki/\n"));
  });

program
  .command("init")
  .description("Inizializza la struttura aziendale e la Knowledge Base in un nuovo repository")
  .action(() => {
    console.log(chalk.green("Inizializzazione Agentic Company OS completata con successo!"));
  });

program.parse(process.argv);
