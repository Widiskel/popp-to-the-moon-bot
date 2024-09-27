import { API } from "../api/api.js";
import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";

export class Popp extends API {
  constructor(account, query, queryObj) {
    super(query);
    this.account = account;
    this.query = query;
    this.queryObj = queryObj;
  }

  async login() {
    try {
      await Helper.delay(1000, this.account, `Try to Login...`, this);
      const loginBody = {
        initData: this.query,
        initDataUnsafe: this.queryObj,
      };

      const res = await this.fetch("/pass/login", "POST", undefined, loginBody);
      if (res.code == "200") {
        await Helper.delay(1000, this.account, `Successfully Login`, this);
        this.token = res.data.token;
        this.signIn = res.data.signIn;
      } else {
        throw Error(res.msg);
      }
    } catch (error) {
      throw error;
    }
  }
  async getAsset(msg = true) {
    try {
      if (msg) {
        await Helper.delay(1000, this.account, `Getting Assets...`, this);
      }
      const res = await this.fetch("/moon/asset", "GET", this.token);
      if (res.code == "200") {
        this.asset = res.data;
        if (msg) {
          await Helper.delay(
            1000,
            this.account,
            `Successfully Get Assets`,
            this
          );
        }
      } else {
        throw Error(res.msg);
      }
    } catch (error) {
      throw error;
    }
  }
  async startFarming() {
    try {
      await Helper.delay(1000, this.account, `Starting Farming...`, this);
      const res = await this.fetch("/moon/farming", "GET", this.token);
      if (res.code == "200") {
        await Helper.delay(
          1000,
          this.account,
          `Successfully Start Farming`,
          this
        );
        await this.getAsset(false);
      } else if (res.code == 400) {
        await Helper.delay(1000, this.account, `Farming already started`, this);
      } else {
        throw Error(res.msg);
      }
    } catch (error) {
      throw error;
    }
  }
  async claimFarming() {
    try {
      await Helper.delay(
        1000,
        this.account,
        `Claiming Farming Reward...`,
        this
      );
      const res = await this.fetch("/moon/claim/farming", "GET", this.token);
      if (res.code == "200") {
        await Helper.delay(1000, this.account, `Farming Reward Claimed`, this);
        await this.getAsset(false);
      } else {
        throw Error(res.msg);
      }
    } catch (error) {
      throw error;
    }
  }
  async getPlanet() {
    try {
      await Helper.delay(
        1000,
        this.account,
        `Scanning For Available Planet...`,
        this
      );
      const res = await this.fetch("/moon/planets", "GET", this.token);
      if (res.code == "200") {
        this.planet = res.data;
        // console.log(this.planet);
        if (this.planet.length > 0) {
          for (const planet of this.planet) {
            if (this.asset.probe > 0) {
              await this.explorePlanet(planet.id);
            } else {
              await Helper.delay(
                1000,
                this.account,
                `Cannot Explore Planet Probe is not Enough...`,
                this
              );
            }
          }
        } else {
          await Helper.delay(
            3000,
            this.account,
            `No available planet to explore`,
            this
          );
        }
      } else {
        throw Error(res.msg);
      }
      await this.getAsset(false);
    } catch (error) {
      throw error;
    }
  }
  async explorePlanet(planetId) {
    try {
      await Helper.delay(
        1000,
        this.account,
        `Exploring planet ${planetId}...`,
        this
      );
      const res = await this.fetch(
        `/moon/explorer?plantId=${planetId}`,
        "GET",
        this.token
      );
      if (res.code == "200") {
        await Helper.delay(
          3000,
          this.account,
          `Planet Explored, got ${res.data.amount} ${res.data.award}`,
          this
        );
        await this.getAsset(false);
      } else {
        throw Error(res.msg);
      }
    } catch (error) {
      throw error;
    }
  }
  async getTask(msg = false) {
    try {
      if (msg) await Helper.delay(1000, this.account, `Getting Tasks...`, this);
      const res = await this.fetch("/moon/task/list", "GET", this.token);
      if (res.code == "200") {
        this.task = res.data;
        if (msg)
          await Helper.delay(1000, this.account, `Successfully Get Task`, this);
      } else {
        throw Error(res.msg);
      }
    } catch (error) {
      throw error;
    }
  }

  async checkIn() {
    try {
      await Helper.delay(1000, this.account, `Try to Sign In...`, this);
      const res = await this.fetch("/moon/sign/in", "POST", this.token);
      if (res.code == "200") {
        await Helper.delay(1000, this.account, `Signed In`, this);
        this.asset = res.data;
      } else if (res.code == "400") {
        await Helper.delay(
          1000,
          this.account,
          `User Already Signed In Today`,
          this
        );
      } else {
        throw Error(res.msg);
      }
    } catch (error) {
      throw error;
    }
  }
  async completeVisitTask(task) {
    try {
      await Helper.delay(
        1000,
        this.account,
        `Completing ${task.name}...`,
        this
      );
      const res = await this.fetch("/moon/task/visit/ss", "POST", this.token);
      if (res.code == "200") {
        await Helper.delay(
          1000,
          this.account,
          `Task ${task.name} Completed Successfully`,
          this
        );
        await this.getTask();
        await this.getAsset(false);
        await this.claimTask(task);
      } else {
        throw Error(res.msg);
      }
    } catch (error) {
      throw error;
    }
  }
  async checkTask(task) {
    try {
      await Helper.delay(
        1000,
        this.account,
        `Checking Task ${task.name}...`,
        this
      );
      const res = await this.fetch(
        `/moon/task/check?taskId=${task.taskId}`,
        "GET",
        this.token
      );
      if (res.code == "200") {
        await Helper.delay(
          1000,
          this.account,
          `Task ${task.name} Checked...`,
          this
        );
        await this.claimTask(task);
      } else {
        await Helper.delay(
          3000,
          this.account,
          `Task ${task.name} Failed to Complete , Error : ${res.msg}...`,
          this
        );
      }
    } catch (error) {
      throw error;
    }
  }
  async claimTask(task) {
    try {
      await Helper.delay(1000, this.account, `Claiming ${task.name}...`, this);
      const res = await this.fetch(
        `/moon/task/claim?taskId=${task.taskId}`,
        "GET",
        this.token
      );
      if (res.code == "200") {
        await Helper.delay(
          3000,
          this.account,
          `Task ${task.name} Reward Claimed Successfully`,
          this
        );
        await this.getAsset(false);
      } else if (res.code == "400") {
        await Helper.delay(
          3000,
          this.account,
          `Task ${task.name} Currently Unclamable, Condition Not Meet`,
          this
        );
      } else {
        throw Error(res.msg);
      }
    } catch (error) {
      throw error;
    }
  }
}
