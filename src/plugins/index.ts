import { signature } from './signature';
import dateTime from './date/dateTime.js';
import date from './date/date.js';
import time from './date/time.js';
import imageFill from './image/imageFill.js';
import headerFooter from './headerFooter.js';

// import select from './select/index.js';

const plugins = {
  signature,
  dateTime,
  date,
  time,
  imageFill,
  // headerFooter,
  // select,
};

export default plugins;
