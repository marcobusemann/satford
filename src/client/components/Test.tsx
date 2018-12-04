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
    calendarData: any,
    areaData: any,
}

const panelColors = ["#EEEEEE", "#61ff69", "#ff6961"];

export class Test extends React.Component<IProps, IState> {
    private socket: SocketIOClient.Socket;

    constructor(props) {
        super(props);
        this.state = {
            results: [],
            calendarData: {},
            areaData: [],
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

                const date = moment(data.timestamp).format("YYYY-MM-DD");
                const calendarData = Object.assign({}, this.state.calendarData);
                calendarData[date] = data.success ? 1 : 2;

                const areaData = [].concat(this.state.areaData);
                if (data.success)
                    areaData[areaData.length - 2].success++;
                else
                    areaData[areaData.length - 2].failed++;

                this.setState({ results, calendarData, areaData });
            }
        });

        this.socket.on("RECEIVE_DATA_FOR_TEST", (data: any) => {
            this.setState({ 
                results: data.results,
                calendarData: data.charts.calendar,
                areaData: data.charts.area,
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
        const { results, calendarData, areaData } = this.state;
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
                            values={calendarData}
                            until={moment().format("YYYY-MM-DD")}
                            panelColors={panelColors}
                        />

                        <AreaChart
                            width={600}
                            height={400}
                            data={areaData}
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
