import * as React from 'react';
import { render } from 'react-dom';
import * as moment from 'moment';

import { App } from './App';

import 'moment/min/locales';
import 'antd/dist/antd.css';
import './styles.css'

moment.locale(navigator.language);

render(<App/>, document.getElementById('app'));