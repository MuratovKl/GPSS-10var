import {time} from './time.mjs';
import {exponential} from './generator.mjs';


class TrafficLight {
  constructor() {
    // delay before green for people
    this.buttonPressDelay = 10;
    // duration of green for people
    this.buttonPressTimeout = 10;
    // time of last button press
    this.buttonPressTime = -Infinity;
    this.buttonIsPressed = false;
    this.carCanGo = true;
    this.carQueue = [];
    this.peopleQueue = [];

    this.carIsGoing = false;

    this.waitLateMan = this.waitLateMan.bind(this);
    this.goMan = this.goMan.bind(this);
    this.pressButton = this.pressButton.bind(this);
    this.proccessQueues = this.proccessQueues.bind(this);
    this.planClearCarQueue = this.planClearCarQueue.bind(this);
    this.goCar = this.goCar.bind(this);
  }

  get manCanGo() {
    return !this.carCanGo;
  }

  // green for people
  get buttonLightedTime() {
    return this.buttonPressTime + this.buttonPressDelay;
  }

  get canPressButton() {
    return !this.buttonIsPressed && ((this.buttonPressTime + this.buttonPressDelay + this.buttonPressTimeout) <= time.time);
  }

  isManIsLate({arrival}) {
    return (this.buttonLightedTime + this.buttonPressTimeout - arrival) <= 3;
  }

  async waitLateMan({arrival}) {
    const late = this.buttonLightedTime + this.buttonPressTimeout - arrival;
    if (late <= 3 && late > 0) {
      console.log(`waiting for button release ${late}`);
      await new Promise((resolve, reject) => {
        time.subscribeOnDelta({callback: resolve, delta: late});
      });
    }
  }

  async goMan() {
    await this.waitLateMan({arrival: time.time});
    if (this.manCanGo) {
      console.log('man go, no wait');
      return;
    }
    if (this.canPressButton) {
      console.log('i pressed button');
      this.pressButton();
    }
    console.log('i`m man in queue');
    await new Promise((resolve, reject) => {
      this.peopleQueue.push({callback: resolve, arrival: time.time});
    });
    console.log('MAN DEPARTED FROM QUEUE!!!');
  }

  pressButton() {
    this.buttonIsPressed = true;
    this.buttonPressTime = time.time;
    time.subscribeOnDelta({callback: () => {
      this.carCanGo = false;
      this.proccessQueues();
      this.buttonIsPressed = false;
      time.subscribeOnDelta({ callback: () => {
        this.carCanGo = true;
        this.proccessQueues();
      }, delta: this.buttonPressTimeout})
    }, delta: this.buttonPressDelay});
  }

  proccessQueues() {
    if (this.manCanGo) {
      this.peopleQueue = this.peopleQueue
        .filter((el) => {
          if (!this.isManIsLate({arrival: el.arrival})) {
            el.callback();
            return false;
          }
          return true;
        });
    }
    if (this.carCanGo) {
      this.planClearCarQueue();
    }
  }

  planClearCarQueue(firstCarCallback = null) {
    if (this.carIsGoing || (firstCarCallback === null && this.carQueue.length === 0)) {
      return;
    }
    this.carIsGoing = true;

    let planFirstCar = !!firstCarCallback;

    const self = this;

    function* clearCarQueueGenerator() {
      const clearCarQueueExp10 = exponential('clearCar', 6);
      const clearCarQueueExpInf = exponential('clearCarInf', 60 / 50);
      while (self.carQueue.length > 0 || planFirstCar) {
        if (time.time - (self.buttonLightedTime + self.buttonPressTimeout + 10)) {
          const {value: next} = clearCarQueueExp10.next();
          yield next;
        } else {
          const {value: next} = clearCarQueueExpInf.next();
          yield next;
        }
      }
      self.carIsGoing = false;
    };

    const clearCarQueueCallback = () => {
      if (planFirstCar) {
        firstCarCallback();
        planFirstCar = false;
        return;
      }
      const {callback} = this.carQueue.shift();
      callback();
    }

    time.addGenerator({gen: clearCarQueueGenerator(), callback: clearCarQueueCallback});
  }

  async goCar() {
    if (this.carCanGo) {
      console.log('GREEN! car can go');
      if (this.carIsGoing) {
        console.log('car pushed in queue');
        await new Promise((resolve, reject) => {
          this.carQueue.push({callback: resolve});
        });
        console.log('car depart');
        return;
      }
      console.log('car is riding road first');
      await new Promise((resolve, reject) => {
        this.planClearCarQueue(resolve);
      });
      console.log('car ride first');
      return;
    }
    console.log('RED! stop, go to queue');
    await new Promise((resolve, reject) => {
      this.carQueue.push({callback: resolve});
    });
    console.log('RED! car depart');
  }
}

export default TrafficLight;

