'use strict';

import Core from './core/index';
import AnonToggle from './modules/anonToggle';
import ChapterHTMLEditor from './modules/chapterHTMLEditor';
import Linker from './modules/linker';
import LiveImages from './modules/liveImages';

const core = new Core();

core.addModule(AnonToggle);
core.addModule(ChapterHTMLEditor);
core.addModule(Linker);
core.addModule(LiveImages);
