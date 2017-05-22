'use strict';

import {Core} from './core/index';
import Linker from './modules/linker';

const core = new Core();

core.addModule(Linker);
