// Included by every example to define some common behaviour (RTI right now)
import {TypePanel} from '@runtime-type-inspector/runtime';
import 'display-anything/src/style.js';
import {Worker as WorkerWithImportMap} from 'worker-with-import-map';
class WorkerRTI extends WorkerWithImportMap {
  constructor(...args) {
    super(...args);
    console.log("New RTI worker", this);
    this.addEventListener('message', (e) => {
      // console.log("e.data", e.data);
      if (e.data.type !== 'rti') {
        return;
      }
      typePanel.handleEvent(e);
      e.preventDefault();
      e.stopPropagation();
    });
  }
}
let Worker = WorkerWithImportMap;
if (location.search.includes("rti")) {
  Worker = WorkerRTI;
  const typePanel = new TypePanel;
  window.typePanel = typePanel;
}
export {Worker};
