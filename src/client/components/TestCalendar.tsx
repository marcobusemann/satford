import * as React from 'react';
import * as moment from 'moment';
import * as elementResizeDetectorMaker from "element-resize-detector";

interface IState {
    columns: number;
    maxWidth: number;
    weekNames: string[];
    monthNames: string[];
}

interface IProps {
    values: any;
    until: any;
    panelColors: any[];
}

export class GitHubCalendar extends React.Component<IProps, IState> {

    private monthLabelHeight: number; 
    private weekLabelWidth: number; 
    private panelSize: number; 
    private panelMargin: number; 
    private elementResizeDetector: any;
    private resizeHandler: any;

    private calendarContainer: any;

    constructor(props) {
        super(props);

        this.monthLabelHeight = 15;
        this.weekLabelWidth = 15;
        this.panelSize = 11;
        this.panelMargin = 2;
        this.calendarContainer = React.createRef<HTMLDivElement>();

        this.state = {
            columns: 53,
            maxWidth: 53,
            weekNames: ['', 'M', '', 'W', '', 'F', ''],
            monthNames: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ],
        }
    }

    getPanelPosition(row, col) {
        var bounds = this.panelSize + this.panelMargin;
        return {
            x: this.weekLabelWidth + bounds * row,
            y: this.monthLabelHeight + bounds * col
        };
    }

    makeCalendarData(history, lastDay, columns) {
        var lastWeekend = new Date(lastDay);
        lastWeekend.setDate(lastWeekend.getDate() + (6 - lastWeekend.getDay()));

        var _endDate = moment(lastDay, 'YYYY-MM-DD');
        _endDate.add(1, 'days');
        _endDate.subtract(1, 'milliseconds');

        var result = [];
        for (var i = 0; i < columns; i++) {
            result[i] = [];
            for (var j = 0; j < 7; j++) {
                var date = new Date(lastWeekend);
                date.setDate(date.getDate() - ((columns - i - 1) * 7 + (6 - j)));

                var momentDate = moment(date);
                if (momentDate < _endDate) {
                    var key = momentDate.format('YYYY-MM-DD');
                    result[i][j] = {
                        value: history[key] || 0,
                        date: date
                    };
                } else {
                    result[i][j] = null;
                }
            }
        }

        return result;
    }

    componentDidMount() {
        this.elementResizeDetector = elementResizeDetectorMaker({ strategy: "scroll" });
        this.resizeHandler = () => this.updateSize();

        this.elementResizeDetector.listenTo(
            this.calendarContainer.current,
            this.resizeHandler);
        this.updateSize();
    }

    componentWillUnmount() {
        this.elementResizeDetector.uninstall(this.calendarContainer.current);
    }

    render() {
        const columns = this.state.columns;
        const values = this.props.values;
        const until = this.props.until;

        var contributions = this.makeCalendarData(values, until, columns);
        var innerDom = [];

        // panels
        for (var i = 0; i < columns; i++) {
            for (var j = 0; j < 7; j++) {
                var contribution = contributions[i][j];
                if (contribution === null) continue;
                const pos = this.getPanelPosition(i, j);
                const color = this.props.panelColors[contribution.value];
                const dom = (
                    <rect
                        key={'panel_key_' + i + '_' + j}
                        x={pos.x}
                        y={pos.y}
                        width={this.panelSize}
                        height={this.panelSize}
                        fill={color}
                    />
                );
                innerDom.push(dom);
            }
        }

        // week texts
        for (var i = 0; i < this.state.weekNames.length; i++) {
            const textBasePos = this.getPanelPosition(0, i);
            const dom = (
                <text
                    key={'week_key_' + i}
                    className='week'
                    x={textBasePos.x - this.panelSize / 2 - 2}
                    y={textBasePos.y + this.panelSize / 2}
                    textAnchor={'middle'}>
                    {this.state.weekNames[i]}
                </text>
            );
            innerDom.push(dom);
        }

        // month texts
        var prevMonth = -1;
        for (var i = 0; i < columns; i++) {
            if (contributions[i][0] === null) continue;
            var month = contributions[i][0].date.getMonth();
            if (month != prevMonth) {
                var textBasePos = this.getPanelPosition(i, 0);
                innerDom.push(<text
                    key={'month_key_' + i}
                    className='month'
                    x={textBasePos.x + this.panelSize / 2}
                    y={textBasePos.y - this.panelSize / 2 - 2}
                    textAnchor={'middle'}>
                    {this.state.monthNames[month]}
                </text>
                );
            }
            prevMonth = month;
        }

        return (
            <div ref={this.calendarContainer} className="calendar-wrapper">
                <svg className="calendar" height="110">
                    {innerDom}
                </svg>
            </div>
        );
    }

    updateSize() {
        if (!this.calendarContainer.current)
            return;

        var width = this.calendarContainer.current.offsetWidth;
        var visibleWeeks = Math.floor((width - this.weekLabelWidth) / 13);
        this.setState({
            columns: Math.min(visibleWeeks, this.state.maxWidth)
        });
    }
};