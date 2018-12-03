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

interface IRouterProps {
    name: string;
}

interface IProps extends RouteComponentProps<IRouterProps> {}

interface IState {
    results: ITestResult[];
}

const panelColors = ["#EEEEEE", "#61ff69", "#ff6961"];

export class Test extends React.Component<IProps, IState> {
    private socket: SocketIOClient.Socket;

    constructor(props) {
        super(props);
        this.state = {
            results: []
        };
    }

    componentDidMount() {
        this.socket = socketIo();
        this.socket.on("HELLO", () => {
            console.log("Connected to server");
        });

        this.socket.on("TEST_FINISHED", (data: ITestResult) => {
            if (data.name === this.props.match.params.name) {
                const results = [data].concat(this.state.results);
                this.setState({ results });
            }
        });

        this.socket.on("RECEIVE_RESULTS_FOR_TEST", (data: ITestResult[]) => {
            this.setState({ results: data });
        });

        const testName = this.props.match.params.name;
        this.socket.emit("RESULTS_FOR_TEST", testName);
    }

    componentWillUnmount() {
        this.socket.disconnect();
        this.socket.close();
    }

    render() {
        const { results } = this.state;
        const testName = this.props.match.params.name;

        let calendarChartData = {};
        let chartDataMap = {};
        let chartData = [];

        if (results.length !== 0) {
            const latest = results[0];
            console.log('latest', latest);
            chartData.push({
                date: moment(latest.timestamp).subtract(1, 'day').format("YYYY-MM-DD"),
                success: 0,
                failed: 0,
            });
        }

        results.forEach(result => {
            const date = moment(result.timestamp).format("YYYY-MM-DD");
            if (!calendarChartData[date]) {
                const index = result.success ? 1 : 2;
                calendarChartData[date] = index;
            }

            if (!chartDataMap[date]) {
                const dayData = {
                    date: date,
                    success: 0,
                    failed: 0,
                };
                chartDataMap[date] = dayData;
                chartData.push(dayData);
            }

            if (result.success)
                chartDataMap[date].success++;
            else
                chartDataMap[date].failed++;
        });

        if (results.length !== 0) {
            const last = results[results.length - 1];
            console.log('last', last);
            chartData.push({
                date: moment(last.timestamp).add(1, 'day').format("YYYY-MM-DD"),
                success: 0,
                failed: 0,
            })
        }

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
                            values={calendarChartData}
                            until={moment().format("YYYY-MM-DD")}
                            panelColors={panelColors}
                        />

                        <AreaChart
                            width={600}
                            height={400}
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Area
                                type="monotone"
                                dataKey="success"
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
                        dataSource={results}
                        rowKey="timestamp"
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
