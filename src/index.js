'use strict';

import Core from './core/index';
import Linker from './modules/linker';
import LiveImages from './modules/liveImages';

const core = new Core();

core.addModule(Linker);
core.addModule(LiveImages);
