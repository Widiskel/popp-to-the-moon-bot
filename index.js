import { Config } from "./src/config/config.js";
import { Popp } from "./src/core/poop.js";
import { Telegram } from "./src/core/telegram.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";
import twist from "./src/utils/twist.js";

async function operation(acc, query, queryObj) {
  try {
    const popp = new Popp(acc, query, queryObj);
    await popp.login();
    if (popp.signIn == 0) {
      await popp.checkIn();
    }
    await popp.getAsset();
    await popp.getTask();
    const uncompletableTask = [5, 7, 9];
    for (const task of popp.task) {
      if (!uncompletableTask.includes(task.taskId)) {
        if (task.status == 0 && task.current == task.threshold) {
          if (task.taskId == 1) {
            await popp.completeVisitTask(task);
          } else {
            await popp.checkTask(task);
          }
        } else if (task.status == 1) {
          await popp.claimTask(task);
        }
      }
    }
    await popp.getPlanet();
    await popp.startFarming();
    while (popp.asset.frozenFarmingSd == 0) {
      await Helper.delay(
        popp.asset.time * 1000,
        acc,
        `Waiting for farming reward available to claim`,
        popp
      );
      await popp.getAsset(false);
      if (popp.asset.frozenFarmingSd != 0) {
        await Helper.delay(3000, acc, `Its Farming Claim Time...`, popp);
      }
    }

    await popp.claimFarming();
    twist.clear(acc);
    twist.clearInfo();
    await Helper.delay(
      10000,
      acc,
      `Account ${acc.id} Processing Complete`,
      popp
    );
    await operation(acc, query, queryObj);
  } catch (error) {
    twist.clear(acc);
    twist.clearInfo();
    await Helper.delay(10000, acc, `Error : ${error.message}`);
    await this.operation(acc, query, queryObj);
  }
}

let init = false;
async function startBot() {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`BOT STARTED`);
      if (
        Config.TELEGRAM_APP_ID == undefined ||
        Config.TELEGRAM_APP_HASH == undefined
      ) {
        throw new Error(
          "Please configure your TELEGRAM_APP_ID and TELEGRAM_APP_HASH first"
        );
      }
      const tele = await new Telegram();
      if (init == false) {
        await tele.init();
        init = true;
      }

      const sessionList = Helper.getSession("sessions");
      const paramList = [];

      for (const acc of sessionList) {
        await tele.useSession("sessions/" + acc);
        tele.session = acc;
        const user = await tele.client.getMe();
        const query = await tele
          .resolvePeer()
          .then(async () => {
            return await tele.initWebView();
          })
          .catch((err) => {
            throw err;
          });

        const queryObj = Helper.queryToJSON(query);
        await tele.disconnect();
        paramList.push([user, query, queryObj]);
      }

      const promiseList = paramList.map(async (data) => {
        await operation(data[0], data[1], data[2]);
      });

      await Promise.all(promiseList);
      resolve();
    } catch (error) {
      logger.info(`BOT STOPPED`);
      logger.error(JSON.stringify(error));
      reject(error);
    }
  });
}

(async () => {
  try {
    logger.clear();
    logger.info("");
    logger.info("Application Started");
    console.log("POPP To The Moon BOT");
    console.log("By : Widiskel");
    console.log("Dont forget to run git pull to keep up to date");
    await startBot();
  } catch (error) {
    twist.clear();
    twist.clearInfo();
    console.log("Error During executing bot", error);
    await startBot();
  }
})();
