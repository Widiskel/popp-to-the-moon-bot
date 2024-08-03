import { Twisters } from "twisters";
import { Helper } from "./helper.js";
import logger from "./logger.js";
import { Popp } from "../core/poop.js";

class Twist {
  constructor() {
    /** @type  {Twisters}*/
    this.twisters = new Twisters();
  }

  /**
   * @param {string} acc
   * @param {Popp} popp
   * @param {string} msg
   * @param {string} delay
   */
  log(msg = "", acc = "", popp = new Popp(), delay) {
    // console.log(acc);
    if (delay == undefined) {
      logger.info(`${acc.id} - ${msg}`);
      delay = "-";
    }

    const assets = popp.asset ?? {};
    const sd = assets.sd ?? "-";
    const probe = assets.probe ?? "-";
    const farmedSd = assets.frozenFarmingSd ?? "-";

    this.twisters.put(acc.id, {
      text: `
================= Account ${acc.id} =============
Name      : ${acc.firstName} ${acc.lastName}
SD        : ${sd}
Farmed SD : ${farmedSd}
PROBE     : ${probe}

Status : ${msg}
Delay : ${delay}
==============================================`,
    });
  }
  /**
   * @param {string} msg
   */
  info(msg = "") {
    this.twisters.put(2, {
      text: `
==============================================
Info : ${msg}
==============================================`,
    });
    return;
  }

  clearInfo() {
    this.twisters.remove(2);
  }

  clear(acc) {
    this.twisters.remove(acc);
  }
}
export default new Twist();
