import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import * as socketIo from "socket.io-client";
import { ITestResult } from "../../shared/ITestResult";
import { Table, Breadcrumb } from "antd";
import { Link } from "react-router-dom";
import * as moment from "moment";
import { GitHubCalendar } from "./TestCalendar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

import "./TestCalendar.css";
import {
    ITestHistory,
    ITestDayStatistic,
    MovingTestHistory
} from "../../shared/ITestHistory";

interface IRouterProps {
    name: string;
}

interface IProps extends RouteComponentProps<IRouterProps> {}

interface IState {
    history: ITestHistory;
}

const panelColors = ["#EEEEEE", "#61ff69", "#ff6961"];

export class Test extends React.Component<IProps, IState> {
    private socket: SocketIOClient.Socket;

    constructor(props) {
        super(props);

        const history: ITestHistory = {
            results: [],
            calendarChart: {},
            dayStatistic: []
        };

        this.state = {
            history
        };
    }

    componentDidMount() {
        this.socket = socketIo();
        this.socket.on("HELLO", () => {
            console.log("Connected to server");
        });

        this.socket.on("TEST_FINISHED", (result: ITestResult) => {
            if (result.name !== this.props.match.params.name) return;

            const movingHistory = new MovingTestHistory(this.state.history);
            this.setState({ history: movingHistory.move(result) });
        });

        this.socket.on("RECEIVE_DATA_FOR_TEST", (data: ITestHistory) => {
            this.setState({
                history: data
            });
        });

        const testName = this.props.match.params.name;
        this.socket.emit("DATA_FOR_TEST", testName);
    }

    componentWillUnmount() {
        this.socket.disconnect();
        this.socket.close();
    }

    render() {
        const { history } = this.state;
        const testName = this.props.match.params.name;

        return (
            <React.Fragment>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Tests</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>{testName}</Breadcrumb.Item>
                </Breadcrumb>
                <div
                    style={{
                        background: "#fff",
                        padding: 24,
                        minHeight: 280
                    }}
                >
                    <h1 style={{ textAlign: "center" }}>{testName}</h1>
                    <div
                        style={{
                            marginLeft: "10em",
                            marginRight: "10em",
                            marginTop: "4em",
                            marginBottom: "4em"
                        }}
                    >
                        <GitHubCalendar
                            values={history.calendarChart}
                            until={moment().format("YYYY-MM-DD")}
                            panelColors={panelColors}
                        />

                        <AreaChart
                            width={600}
                            height={400}
                            data={history.dayStatistic}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Area
                                type="monotone"
                                dataKey="successful"
                                stackId="1"
                                stroke="#8884d8"
                                fill="#61ff69"
                            />
                            <Area
                                type="monotone"
                                dataKey="failed"
                                stackId="2"
                                stroke="#82ca9d"
                                fill="#ff6961"
                            />
                        </AreaChart>
                    </div>
                    <Table
                        dataSource={history.results}
                        rowKey={item => {
                            return item.timestamp + item.name;
                        }}
                        rowClassName={result =>
                            result.success ? "success" : "failure"
                        }
                    >
                        <Table.Column
                            title="Timestamp"
                            key="timestamp"
                            dataIndex="timestamp"
                            render={timestamp =>
                                moment(timestamp).format("LLL")
                            }
                        />
                        <Table.Column
                            title="Data"
                            key="data"
                            dataIndex="data"
                            render={data => JSON.stringify(data)}
                        />
                    </Table>
                </div>
            </React.Fragment>
        );
    }
}
